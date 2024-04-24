/* eslint-disable */
import path from 'path';
import { fs, types, selectors, log, util } from 'vortex-api';
import { GAME_ID, MOD_CONFIG, RGX_INVALID_CHARS_WINDOWS, MOD_TYPE_CONFIG, getBundledMods } from './common';
import { setMergeConfigs } from './actions';
import { IFileEntry } from './types';
import { walkPath, defaultModsRelPath } from './util';

import { findSMAPIMod } from './SMAPI';
import { IEntry } from 'turbowalk';

const syncWrapper = (api: types.IExtensionApi) => {
  onSyncModConfigurations(api);
}

export function registerConfigMod(context: types.IExtensionContext) {
  context.registerAction('mod-icons', 999, 'swap', {}, 'Sync Mod Configurations',
    () => syncWrapper(context.api),
    () => {
      const state = context.api.store.getState();
      const gameMode = selectors.activeGameId(state);
      return (gameMode === GAME_ID);
    });
}

async function onSyncModConfigurations(api: types.IExtensionApi): Promise<void> {
  const state = api.getState();
  const profile = selectors.activeProfile(state);
  if (profile?.gameId !== GAME_ID) {
    return;
  }
  const mergeConfigs = util.getSafe(state, ['settings', 'SDV', 'mergeConfigs', profile.id], false);
  if (!mergeConfigs) {
    const result = await api.showDialog('info', 'Mod Configuration Sync', {
      bbcode: 'Many Stardew Valley mods generate their own configuration files during game play. By default the generated files are, '
              + 'ingested by their respective mods.[br][/br][br][/br]'
              + 'Unfortunately the mod configuration files are lost when updating or removing a mod.[br][/br][br][/br] This button allows you to '
              + 'Import all of your active mod\'s configuration files into a single mod which will remain unaffected by mod updates.[br][/br][br][/br]'
              + 'Would you like to enable this functionality?',
    }, [
      { label: 'Close' },
      { label: 'Enable' }
    ]);

    if (result.action === 'Close') {
      return;
    }

    if (result.action === 'Enable') {
      api.store.dispatch(setMergeConfigs(profile.id, true));
    }
  }

  type EventType = 'purge-mods' | 'deploy-mods';
  const eventPromise = (api: types.IExtensionApi, eventType: EventType) => new Promise<void>((resolve, reject) => {
    const cb = (err: any) => err !== null ? reject(err): resolve();
    (eventType === 'purge-mods')
      ? api.events.emit(eventType, false, cb)
      : api.events.emit(eventType, cb);
  });

  try {
    const mod = await initialize(api);
    if (mod?.configModPath === undefined) {
      return;
    }
    await eventPromise(api, 'purge-mods');

    const installPath = selectors.installPathForGame(api.getState(), GAME_ID);
    const resolveCandidateName = (file: IEntry): string => {
      const relPath = path.relative(installPath, file.filePath);
      const segments = relPath.split(path.sep);
      return segments[0];
    }
    const files = await walkPath(installPath);
    const filtered = files.reduce((accum: IFileEntry[], file: IEntry) => {
      if (path.basename(file.filePath).toLowerCase() === MOD_CONFIG && !path.dirname(file.filePath).includes(mod.configModPath)) {
        accum.push({ filePath: file.filePath, candidates: [resolveCandidateName(file)] });
      }
      return accum;
    }, []);
    await addModConfig(api, filtered, installPath);
    await eventPromise(api, 'deploy-mods');
  } catch (err) {
    api.showErrorNotification('Failed to sync mod configurations', err);
  }
}

function sanitizeProfileName(input: string) {
  return input.replace(RGX_INVALID_CHARS_WINDOWS, '_');
}

function configModName(profileName: string) {
  return `Stardew Valley Configuration (${sanitizeProfileName(profileName)})`;
}

type ConfigMod = {
  mod: types.IMod;
  configModPath: string;
}
async function initialize(api: types.IExtensionApi): Promise<ConfigMod> {
  const state = api.getState();
  const profile = selectors.activeProfile(state);
  if (profile?.gameId !== GAME_ID) {
    return Promise.resolve(undefined);
  }
  const mergeConfigs = util.getSafe(state, ['settings', 'SDV', 'mergeConfigs', profile.id], false);
  if (!mergeConfigs) {
    return Promise.resolve(undefined);
  }

  try {
    const mod = await ensureConfigMod(api);
    const installationPath = selectors.installPathForGame(state, GAME_ID);
    const configModPath = path.join(installationPath, mod.installationPath);
    return Promise.resolve({ configModPath, mod });
  } catch (err) {
    api.showErrorNotification('Failed to resolve config mod path', err);
    return Promise.resolve(undefined);
  }
}

export async function addModConfig(api: types.IExtensionApi, files: IFileEntry[], modsPath?: string) {
  const configMod = await initialize(api);
  if (configMod === undefined) {
    return;
  }

  const state = api.getState();
  const discovery = selectors.discoveryByGame(state, GAME_ID);
  modsPath = modsPath ?? path.join(discovery.path, defaultModsRelPath());
  const smapi = findSMAPIMod(api);
  for (const file of files) {
    if (file.candidates.includes(smapi.installationPath)) {
      // This should never happen but better safe than sorry
      log('error', 'tried to add SMAPI config', JSON.stringify(file));
      continue;
    }
    try {
      const relPath = path.relative(modsPath, file.filePath);
      const targetPath = path.join(configMod.configModPath, relPath);
      const targetDir = path.extname(targetPath) !== '' ? path.dirname(targetPath) : targetPath;
      await fs.ensureDirWritableAsync(targetDir);
      await fs.copyAsync(file.filePath, targetPath, { overwrite: true });
      await fs.removeAsync(file.filePath);
    } catch (err) {
      api.showErrorNotification('Failed to write mod config', err);
    }
  }
}

export async function removeModConfig(api: types.IExtensionApi, files: IFileEntry[]) {
  const configMod = await initialize(api);
  if (configMod === undefined) {
    return;
  }
}

export async function ensureConfigMod(api: types.IExtensionApi): Promise<types.IMod> {
  const state = api.getState();
  const mods: { [modId: string]: types.IMod } = util.getSafe(state, ['persistent', 'mods', GAME_ID], {});
  const modInstalled = Object.values(mods).find(iter => iter.type === MOD_TYPE_CONFIG);
  if (modInstalled !== undefined) {
    return Promise.resolve(modInstalled);
  } else {
    const profile = selectors.activeProfile(state);
    const modName = configModName(profile.name);
    const mod = await createConfigMod(api, modName, profile);
    return Promise.resolve(mod);
  }
}

async function createConfigMod(api: types.IExtensionApi, modName: string, profile: types.IProfile): Promise<types.IMod> {
  const mod = {
    id: modName,
    state: 'installed',
    attributes: {
      name: 'Stardew Valley Mod Configuration',
      description: 'This mod is a collective merge of SDV mod configuration files which Vortex maintains '
        + 'for the mods you have installed. The configuration is maintained through mod updates, '
        + 'but at times it may need to be manually updated',
      logicalFileName: 'Stardew Valley Mod Configuration',
      modId: 42, // Meaning of life
      version: '1.0.0',
      variant: sanitizeProfileName(profile.name.replace(RGX_INVALID_CHARS_WINDOWS, '_')),
      installTime: new Date(),
    },
    installationPath: modName,
    type: MOD_TYPE_CONFIG,
  };

  return new Promise<types.IMod>((resolve, reject) => {
    api.events.emit('create-mod', profile.gameId, mod, async (error) => {
      if (error !== null) {
        return reject(error);
      }
      return resolve(mod as any);
    });
  });
}

export async function onAddedFiles(api: types.IExtensionApi, profileId: string, files: IFileEntry[]) {
  const state = api.store.getState();
  const profile = selectors.profileById(state, profileId);
  if (profile?.gameId !== GAME_ID) {
    // don't care about any other games
    return;
  }

  const mods: { [modId: string]: types.IMod } = util.getSafe(state, ['persistent', 'mods', GAME_ID], {});
  const isSMAPI = (file: IFileEntry) => file.candidates.find(candidate => mods[candidate].type === 'SMAPI') !== undefined;
  const mergeConfigs = util.getSafe(state, ['settings', 'SDV', 'mergeConfigs', profile.id], false);
  const result = files.reduce((accum, file) => {
    if (mergeConfigs && !isSMAPI(file) && path.basename(file.filePath).toLowerCase() === MOD_CONFIG) {
      accum.configs.push(file);
    } else {
      accum.regulars.push(file);
    }
    return accum;
  }, { configs: [] as IFileEntry[], regulars: [] as IFileEntry[] });
  return Promise.all([
    addConfigFiles(api, profileId, result.configs),
    addRegularFiles(api, profileId, result.regulars)
  ]);
}

async function addConfigFiles(api: types.IExtensionApi, profileId: string, files: IFileEntry[]) {
  if (files.length === 0) {
    return Promise.resolve();
  }
  return addModConfig(api, files);
}

async function addRegularFiles(api: types.IExtensionApi, profileId: string, files: IFileEntry[]) {
  if (files.length === 0) {
    return Promise.resolve();
  }
  const state = api.getState();
  const game = util.getGame(GAME_ID);
  const discovery = selectors.discoveryByGame(state, GAME_ID);
  const modPaths = game.getModPaths(discovery.path);
  const installPath = selectors.installPathForGame(state, GAME_ID);
  for (const entry of files) {
    if (entry.candidates.length === 1) {
      const mod = util.getSafe(state.persistent.mods,
        [GAME_ID, entry.candidates[0]],
        undefined);
      if (!isModCandidateValid(mod, entry)) {
        return Promise.resolve();
      }
      const from = modPaths[mod.type ?? ''];
      if (from === undefined) {
        // How is this even possible? regardless it's not this
        //  function's job to report this.
        log('error', 'failed to resolve mod path for mod type', mod.type);
        return Promise.resolve();
      }
      const relPath = path.relative(from, entry.filePath);
      const targetPath = path.join(installPath, mod.id, relPath);
      // copy the new file back into the corresponding mod, then delete it. That way, vortex will
      // create a link to it with the correct deployment method and not ask the user any questions
      try {
        await fs.ensureDirWritableAsync(path.dirname(targetPath));
        await fs.copyAsync(entry.filePath, targetPath);
        await fs.removeAsync(entry.filePath);
      } catch (err) {
        if (!err.message.includes('are the same file')) {
          // should we be reporting this to the user? This is a completely
          // automated process and if it fails more often than not the
          // user probably doesn't care
          log('error', 'failed to re-import added file to mod', err.message);
        }
      }
    }
  }
}

const isModCandidateValid = (mod, entry) => {
  if (mod?.id === undefined || mod.type === 'sdvrootfolder') {
    // There is no reliable way to ascertain whether a new file entry
    //  actually belongs to a root modType as some of these mods will act
    //  as replacement mods. This obviously means that if the game has
    //  a substantial update which introduces new files we could potentially
    //  add a vanilla game file into the mod's staging folder causing constant
    //  contention between the game itself (when it updates) and the mod.
    //
    // There is also a potential chance for root modTypes to conflict with regular
    //  mods, which is why it's not safe to assume that any addition inside the
    //  mods directory can be safely added to this mod's staging folder either.
    return false;
  }

  if (mod.type !== 'SMAPI') {
    // Other mod types do not require further validation - it should be fine
    //  to add this entry.
    return true;
  }

  const segments = entry.filePath.toLowerCase().split(path.sep).filter(seg => !!seg);
  const modsSegIdx = segments.indexOf('mods');
  const modFolderName = ((modsSegIdx !== -1) && (segments.length > modsSegIdx + 1))
    ? segments[modsSegIdx + 1] : undefined;

  let bundledMods = util.getSafe(mod, ['attributes', 'smapiBundledMods'], []);
  bundledMods = bundledMods.length > 0 ? bundledMods : getBundledMods();
  if (segments.includes('content')) {
    // SMAPI is not supposed to overwrite the game's content directly.
    //  this is clearly not a SMAPI file and should _not_ be added to it.
    return false;
  }

  return (modFolderName !== undefined) && bundledMods.includes(modFolderName);
};