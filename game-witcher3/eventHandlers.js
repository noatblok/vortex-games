"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSettingsChange = exports.onProfileWillChange = exports.onDidDeploy = exports.onWillDeploy = exports.onGameModeActivation = void 0;
const vortex_api_1 = require("vortex-api");
const actions_1 = require("./actions");
const common_1 = require("./common");
const menumod_1 = __importDefault(require("./menumod"));
const mergeBackup_1 = require("./mergeBackup");
const util_1 = require("./util");
const iniParser_1 = __importDefault(require("./iniParser"));
const migrations_1 = require("./migrations");
function onGameModeActivation(api) {
    return (gameMode) => __awaiter(this, void 0, void 0, function* () {
        if (gameMode !== common_1.GAME_ID) {
            api.dismissNotification('witcher3-merge');
        }
        else {
            const state = api.getState();
            const lastProfId = vortex_api_1.selectors.lastActiveProfileForGame(state, gameMode);
            const activeProf = vortex_api_1.selectors.activeProfile(state);
            const priorityType = vortex_api_1.util.getSafe(state, (0, common_1.getPriorityTypeBranch)(), 'prefix-based');
            api.store.dispatch((0, actions_1.setPriorityType)(priorityType));
            if (lastProfId !== (activeProf === null || activeProf === void 0 ? void 0 : activeProf.id)) {
                try {
                    yield (0, mergeBackup_1.storeToProfile)(api, lastProfId)
                        .then(() => (0, mergeBackup_1.restoreFromProfile)(api, activeProf === null || activeProf === void 0 ? void 0 : activeProf.id));
                }
                catch (err) {
                    api.showErrorNotification('Failed to restore profile merged files', err);
                }
            }
        }
    });
}
exports.onGameModeActivation = onGameModeActivation;
const onWillDeploy = (api) => {
    return (profileId, deployment) => __awaiter(void 0, void 0, void 0, function* () {
        const state = api.store.getState();
        const activeProfile = (0, util_1.validateProfile)(profileId, state);
        if (activeProfile === undefined) {
            return Promise.resolve();
        }
        return menumod_1.default.onWillDeploy(api, deployment, activeProfile)
            .catch(err => (err instanceof vortex_api_1.util.UserCanceled)
            ? Promise.resolve()
            : Promise.reject(err));
    });
};
exports.onWillDeploy = onWillDeploy;
let prevDeployment = {};
const onDidDeploy = (api, priorityManager) => {
    return (profileId, deployment) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const state = api.getState();
        const activeProfile = (0, util_1.validateProfile)(profileId, state);
        if (activeProfile === undefined) {
            return Promise.resolve();
        }
        if (JSON.stringify(prevDeployment) !== JSON.stringify(deployment)) {
            prevDeployment = deployment;
            queryScriptMerge(api, 'Your mods state/load order has changed since the last time you ran '
                + 'the script merger. You may want to run the merger tool and check whether any new script conflicts are '
                + 'present, or if existing merges have become unecessary. Please also note that any load order changes '
                + 'may affect the order in which your conflicting mods are meant to be merged, and may require you to '
                + 'remove the existing merge and re-apply it.');
        }
        const loadOrder = (0, migrations_1.getPersistentLoadOrder)(api);
        const docFiles = ((_a = deployment['witcher3menumodroot']) !== null && _a !== void 0 ? _a : [])
            .filter(file => file.relPath.endsWith(common_1.PART_SUFFIX)
            && (file.relPath.indexOf(common_1.INPUT_XML_FILENAME) === -1));
        const menuModPromise = () => {
            if (docFiles.length === 0) {
                return menumod_1.default.removeMod(api, activeProfile);
            }
            else {
                return menumod_1.default.onDidDeploy(api, deployment, activeProfile)
                    .then((modId) => __awaiter(void 0, void 0, void 0, function* () {
                    if (modId === undefined) {
                        return Promise.resolve();
                    }
                    api.store.dispatch(vortex_api_1.actions.setModEnabled(activeProfile.id, modId, true));
                    yield api.emitAndAwait('deploy-single-mod', common_1.GAME_ID, modId, true);
                    return Promise.resolve();
                }));
            }
        };
        return menuModPromise()
            .then(() => iniParser_1.default.getInstance().setINIStruct(loadOrder, priorityManager))
            .then(() => iniParser_1.default.getInstance().writeToModSettings())
            .then(() => {
            (0, util_1.forceRefresh)(api);
            return Promise.resolve();
        })
            .catch(err => iniParser_1.default.getInstance().modSettingsErrorHandler(err, 'Failed to modify load order file'));
    });
};
exports.onDidDeploy = onDidDeploy;
const onProfileWillChange = (api) => {
    return (profileId) => __awaiter(void 0, void 0, void 0, function* () {
        const state = api.getState();
        const profile = vortex_api_1.selectors.profileById(state, profileId);
        if ((profile === null || profile === void 0 ? void 0 : profile.gameId) !== common_1.GAME_ID) {
            return;
        }
        const priorityType = vortex_api_1.util.getSafe(state, (0, common_1.getPriorityTypeBranch)(), 'prefix-based');
        api.store.dispatch((0, actions_1.setPriorityType)(priorityType));
        const lastProfId = vortex_api_1.selectors.lastActiveProfileForGame(state, profile.gameId);
        try {
            yield (0, mergeBackup_1.storeToProfile)(api, lastProfId)
                .then(() => (0, mergeBackup_1.restoreFromProfile)(api, profile.id));
        }
        catch (err) {
            if (!(err instanceof vortex_api_1.util.UserCanceled)) {
                api.showErrorNotification('Failed to store profile specific merged items', err);
            }
        }
    });
};
exports.onProfileWillChange = onProfileWillChange;
const onSettingsChange = (api, priorityManager) => {
    return (prev, current) => __awaiter(void 0, void 0, void 0, function* () {
        const state = api.getState();
        const activeProfile = vortex_api_1.selectors.activeProfile(state);
        if ((activeProfile === null || activeProfile === void 0 ? void 0 : activeProfile.gameId) !== common_1.GAME_ID || priorityManager === undefined) {
            return;
        }
        const priorityType = vortex_api_1.util.getSafe(state, (0, common_1.getPriorityTypeBranch)(), 'prefix-based');
        priorityManager.priorityType = priorityType;
        api.events.on('purge-mods', () => {
            iniParser_1.default.getInstance().revertLOFile();
        });
    });
};
exports.onSettingsChange = onSettingsChange;
function getScriptMergerTool(api) {
    const state = api.store.getState();
    const scriptMerger = vortex_api_1.util.getSafe(state, ['settings', 'gameMode', 'discovered', common_1.GAME_ID, 'tools', common_1.SCRIPT_MERGER_ID], undefined);
    if (!!(scriptMerger === null || scriptMerger === void 0 ? void 0 : scriptMerger.path)) {
        return scriptMerger;
    }
    return undefined;
}
function runScriptMerger(api) {
    const tool = getScriptMergerTool(api);
    if ((tool === null || tool === void 0 ? void 0 : tool.path) === undefined) {
        this.notifyMissingScriptMerger(api);
        return Promise.resolve();
    }
    return api.runExecutable(tool.path, [], { suggestDeploy: true })
        .catch(err => api.showErrorNotification('Failed to run tool', err, { allowReport: ['EPERM', 'EACCESS', 'ENOENT'].indexOf(err.code) !== -1 }));
}
function queryScriptMerge(api, reason) {
    const state = api.store.getState();
    const t = api.translate;
    const scriptMergerTool = vortex_api_1.util.getSafe(state, ['settings', 'gameMode', 'discovered', common_1.GAME_ID, 'tools', common_1.SCRIPT_MERGER_ID], undefined);
    if (!!(scriptMergerTool === null || scriptMergerTool === void 0 ? void 0 : scriptMergerTool.path)) {
        api.sendNotification({
            id: 'witcher3-merge',
            type: 'warning',
            message: t('Witcher Script merger may need to be executed', { ns: common_1.I18N_NAMESPACE }),
            allowSuppress: true,
            actions: [
                {
                    title: 'More',
                    action: () => {
                        api.showDialog('info', 'Witcher 3', {
                            text: reason,
                        }, [
                            { label: 'Close' },
                        ]);
                    },
                },
                {
                    title: 'Run tool',
                    action: dismiss => {
                        runScriptMerger(api);
                        dismiss();
                    },
                },
            ],
        });
    }
    else {
        this.notifyMissingScriptMerger(api);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRIYW5kbGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV2ZW50SGFuZGxlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMkNBQTZEO0FBRTdELHVDQUE0QztBQUU1QyxxQ0FDeUU7QUFFekUsd0RBQWdDO0FBQ2hDLCtDQUFtRTtBQUNuRSxpQ0FBdUQ7QUFHdkQsNERBQXVDO0FBQ3ZDLDZDQUFzRDtBQUl0RCxTQUFnQixvQkFBb0IsQ0FBQyxHQUF3QjtJQUMzRCxPQUFPLENBQU8sUUFBZ0IsRUFBRSxFQUFFO1FBQ2hDLElBQUksUUFBUSxLQUFLLGdCQUFPLEVBQUU7WUFHeEIsR0FBRyxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDM0M7YUFBTTtZQUNMLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM3QixNQUFNLFVBQVUsR0FBRyxzQkFBUyxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2RSxNQUFNLFVBQVUsR0FBRyxzQkFBUyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxNQUFNLFlBQVksR0FBRyxpQkFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBQSw4QkFBcUIsR0FBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2xGLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUEseUJBQWUsRUFBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2xELElBQUksVUFBVSxNQUFLLFVBQVUsYUFBVixVQUFVLHVCQUFWLFVBQVUsQ0FBRSxFQUFFLENBQUEsRUFBRTtnQkFDakMsSUFBSTtvQkFDRixNQUFNLElBQUEsNEJBQWMsRUFBQyxHQUFHLEVBQUUsVUFBVSxDQUFDO3lCQUNsQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBQSxnQ0FBa0IsRUFBQyxHQUFHLEVBQUUsVUFBVSxh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LENBQUMsQ0FBQywrQ0FBK0MsRUFBRSxFQUFFLEVBQUUsRUFBRSx1QkFBYyxFQUFFLENBQUM7WUFDbkYsYUFBYSxFQUFFLElBQUk7WUFDbkIsT0FBTyxFQUFFO2dCQUNQO29CQUNFLEtBQUssRUFBRSxNQUFNO29CQUNiLE1BQU0sRUFBRSxHQUFHLEVBQUU7d0JBQ1gsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFOzRCQUNsQyxJQUFJLEVBQUUsTUFBTTt5QkFDYixFQUFFOzRCQUNELEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTt5QkFDbkIsQ0FBQyxDQUFDO29CQUNMLENBQUM7aUJBQ0Y7Z0JBQ0Q7b0JBQ0UsS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBRTt3QkFDaEIsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNyQixPQUFPLEVBQUUsQ0FBQztvQkFDWixDQUFDO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7S0FDSjtTQUFNO1FBQ0wsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3JDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCB7IGFjdGlvbnMsIHR5cGVzLCBzZWxlY3RvcnMsIHV0aWwgfSBmcm9tICd2b3J0ZXgtYXBpJztcclxuXHJcbmltcG9ydCB7IHNldFByaW9yaXR5VHlwZSB9IGZyb20gJy4vYWN0aW9ucyc7XHJcblxyXG5pbXBvcnQgeyBHQU1FX0lELCBnZXRQcmlvcml0eVR5cGVCcmFuY2gsIFBBUlRfU1VGRklYLFxyXG4gIElOUFVUX1hNTF9GSUxFTkFNRSwgU0NSSVBUX01FUkdFUl9JRCwgSTE4Tl9OQU1FU1BBQ0UgfSBmcm9tICcuL2NvbW1vbic7XHJcblxyXG5pbXBvcnQgbWVudU1vZCBmcm9tICcuL21lbnVtb2QnO1xyXG5pbXBvcnQgeyBzdG9yZVRvUHJvZmlsZSwgcmVzdG9yZUZyb21Qcm9maWxlIH0gZnJvbSAnLi9tZXJnZUJhY2t1cCc7XHJcbmltcG9ydCB7IHZhbGlkYXRlUHJvZmlsZSwgZm9yY2VSZWZyZXNoIH0gZnJvbSAnLi91dGlsJztcclxuaW1wb3J0IHsgUHJpb3JpdHlNYW5hZ2VyIH0gZnJvbSAnLi9wcmlvcml0eU1hbmFnZXInO1xyXG5cclxuaW1wb3J0IEluaVN0cnVjdHVyZSBmcm9tICcuL2luaVBhcnNlcic7XHJcbmltcG9ydCB7IGdldFBlcnNpc3RlbnRMb2FkT3JkZXIgfSBmcm9tICcuL21pZ3JhdGlvbnMnO1xyXG5cclxudHlwZSBEZXBsb3ltZW50ID0geyBbbW9kVHlwZTogc3RyaW5nXTogdHlwZXMuSURlcGxveWVkRmlsZVtdIH07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb25HYW1lTW9kZUFjdGl2YXRpb24oYXBpOiB0eXBlcy5JRXh0ZW5zaW9uQXBpKSB7XHJcbiAgcmV0dXJuIGFzeW5jIChnYW1lTW9kZTogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoZ2FtZU1vZGUgIT09IEdBTUVfSUQpIHtcclxuICAgICAgLy8gSnVzdCBpbiBjYXNlIHRoZSBzY3JpcHQgbWVyZ2VyIG5vdGlmaWNhdGlvbiBpcyBzdGlsbFxyXG4gICAgICAvLyAgcHJlc2VudC5cclxuICAgICAgYXBpLmRpc21pc3NOb3RpZmljYXRpb24oJ3dpdGNoZXIzLW1lcmdlJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBzdGF0ZSA9IGFwaS5nZXRTdGF0ZSgpO1xyXG4gICAgICBjb25zdCBsYXN0UHJvZklkID0gc2VsZWN0b3JzLmxhc3RBY3RpdmVQcm9maWxlRm9yR2FtZShzdGF0ZSwgZ2FtZU1vZGUpO1xyXG4gICAgICBjb25zdCBhY3RpdmVQcm9mID0gc2VsZWN0b3JzLmFjdGl2ZVByb2ZpbGUoc3RhdGUpO1xyXG4gICAgICBjb25zdCBwcmlvcml0eVR5cGUgPSB1dGlsLmdldFNhZmUoc3RhdGUsIGdldFByaW9yaXR5VHlwZUJyYW5jaCgpLCAncHJlZml4LWJhc2VkJyk7XHJcbiAgICAgIGFwaS5zdG9yZS5kaXNwYXRjaChzZXRQcmlvcml0eVR5cGUocHJpb3JpdHlUeXBlKSk7XHJcbiAgICAgIGlmIChsYXN0UHJvZklkICE9PSBhY3RpdmVQcm9mPy5pZCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBhd2FpdCBzdG9yZVRvUHJvZmlsZShhcGksIGxhc3RQcm9mSWQpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHJlc3RvcmVGcm9tUHJvZmlsZShhcGksIGFjdGl2ZVByb2Y/LmlkKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICBhcGkuc2hvd0Vycm9yTm90aWZpY2F0aW9uKCdGYWlsZWQgdG8gcmVzdG9yZSBwcm9maWxlIG1lcmdlZCBmaWxlcycsIGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgb25XaWxsRGVwbG95ID0gKGFwaTogdHlwZXMuSUV4dGVuc2lvbkFwaSkgPT4ge1xyXG4gIHJldHVybiBhc3luYyAocHJvZmlsZUlkOiBzdHJpbmcsIGRlcGxveW1lbnQ6IERlcGxveW1lbnQpID0+IHtcclxuICAgIGNvbnN0IHN0YXRlID0gYXBpLnN0b3JlLmdldFN0YXRlKCk7XHJcbiAgICBjb25zdCBhY3RpdmVQcm9maWxlID0gdmFsaWRhdGVQcm9maWxlKHByb2ZpbGVJZCwgc3RhdGUpO1xyXG4gICAgaWYgKGFjdGl2ZVByb2ZpbGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1lbnVNb2Qub25XaWxsRGVwbG95KGFwaSwgZGVwbG95bWVudCwgYWN0aXZlUHJvZmlsZSlcclxuICAgICAgLmNhdGNoKGVyciA9PiAoZXJyIGluc3RhbmNlb2YgdXRpbC5Vc2VyQ2FuY2VsZWQpXHJcbiAgICAgICAgPyBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIDogUHJvbWlzZS5yZWplY3QoZXJyKSk7XHJcbiAgfVxyXG59XHJcblxyXG5sZXQgcHJldkRlcGxveW1lbnQ6IERlcGxveW1lbnQgPSB7fTtcclxuZXhwb3J0IGNvbnN0IG9uRGlkRGVwbG95ID0gKGFwaTogdHlwZXMuSUV4dGVuc2lvbkFwaSwgcHJpb3JpdHlNYW5hZ2VyOiBQcmlvcml0eU1hbmFnZXIpID0+IHtcclxuICByZXR1cm4gYXN5bmMgKHByb2ZpbGVJZDogc3RyaW5nLCBkZXBsb3ltZW50OiBEZXBsb3ltZW50KSA9PiB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IGFwaS5nZXRTdGF0ZSgpO1xyXG4gICAgY29uc3QgYWN0aXZlUHJvZmlsZSA9IHZhbGlkYXRlUHJvZmlsZShwcm9maWxlSWQsIHN0YXRlKTtcclxuICAgIGlmIChhY3RpdmVQcm9maWxlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChKU09OLnN0cmluZ2lmeShwcmV2RGVwbG95bWVudCkgIT09IEpTT04uc3RyaW5naWZ5KGRlcGxveW1lbnQpKSB7XHJcbiAgICAgIHByZXZEZXBsb3ltZW50ID0gZGVwbG95bWVudDtcclxuICAgICAgcXVlcnlTY3JpcHRNZXJnZShhcGksICdZb3VyIG1vZHMgc3RhdGUvbG9hZCBvcmRlciBoYXMgY2hhbmdlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHlvdSByYW4gJ1xyXG4gICAgICAgICsgJ3RoZSBzY3JpcHQgbWVyZ2VyLiBZb3UgbWF5IHdhbnQgdG8gcnVuIHRoZSBtZXJnZXIgdG9vbCBhbmQgY2hlY2sgd2hldGhlciBhbnkgbmV3IHNjcmlwdCBjb25mbGljdHMgYXJlICdcclxuICAgICAgICArICdwcmVzZW50LCBvciBpZiBleGlzdGluZyBtZXJnZXMgaGF2ZSBiZWNvbWUgdW5lY2Vzc2FyeS4gUGxlYXNlIGFsc28gbm90ZSB0aGF0IGFueSBsb2FkIG9yZGVyIGNoYW5nZXMgJ1xyXG4gICAgICAgICsgJ21heSBhZmZlY3QgdGhlIG9yZGVyIGluIHdoaWNoIHlvdXIgY29uZmxpY3RpbmcgbW9kcyBhcmUgbWVhbnQgdG8gYmUgbWVyZ2VkLCBhbmQgbWF5IHJlcXVpcmUgeW91IHRvICdcclxuICAgICAgICArICdyZW1vdmUgdGhlIGV4aXN0aW5nIG1lcmdlIGFuZCByZS1hcHBseSBpdC4nKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGxvYWRPcmRlciA9IGdldFBlcnNpc3RlbnRMb2FkT3JkZXIoYXBpKTtcclxuICAgIGNvbnN0IGRvY0ZpbGVzID0gKGRlcGxveW1lbnRbJ3dpdGNoZXIzbWVudW1vZHJvb3QnXSA/PyBbXSlcclxuICAgICAgLmZpbHRlcihmaWxlID0+IGZpbGUucmVsUGF0aC5lbmRzV2l0aChQQVJUX1NVRkZJWClcclxuICAgICAgICAgICAgICAgICAgICAgICYmIChmaWxlLnJlbFBhdGguaW5kZXhPZihJTlBVVF9YTUxfRklMRU5BTUUpID09PSAtMSkpO1xyXG4gICAgY29uc3QgbWVudU1vZFByb21pc2UgPSAoKSA9PiB7XHJcbiAgICAgIGlmIChkb2NGaWxlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gbWVudSBtb2RzIGRlcGxveWVkIC0gcmVtb3ZlIHRoZSBtb2QuXHJcbiAgICAgICAgcmV0dXJuIG1lbnVNb2QucmVtb3ZlTW9kKGFwaSwgYWN0aXZlUHJvZmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG1lbnVNb2Qub25EaWREZXBsb3koYXBpLCBkZXBsb3ltZW50LCBhY3RpdmVQcm9maWxlKVxyXG4gICAgICAgICAgLnRoZW4oYXN5bmMgbW9kSWQgPT4ge1xyXG4gICAgICAgICAgICBpZiAobW9kSWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXBpLnN0b3JlLmRpc3BhdGNoKGFjdGlvbnMuc2V0TW9kRW5hYmxlZChhY3RpdmVQcm9maWxlLmlkLCBtb2RJZCwgdHJ1ZSkpO1xyXG4gICAgICAgICAgICBhd2FpdCBhcGkuZW1pdEFuZEF3YWl0KCdkZXBsb3ktc2luZ2xlLW1vZCcsIEdBTUVfSUQsIG1vZElkLCB0cnVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIG1lbnVNb2RQcm9taXNlKClcclxuICAgICAgLnRoZW4oKCkgPT4gSW5pU3RydWN0dXJlLmdldEluc3RhbmNlKCkuc2V0SU5JU3RydWN0KGxvYWRPcmRlciwgcHJpb3JpdHlNYW5hZ2VyKSlcclxuICAgICAgLnRoZW4oKCkgPT4gSW5pU3RydWN0dXJlLmdldEluc3RhbmNlKCkud3JpdGVUb01vZFNldHRpbmdzKCkpXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICBmb3JjZVJlZnJlc2goYXBpKTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChlcnIgPT4gSW5pU3RydWN0dXJlLmdldEluc3RhbmNlKCkubW9kU2V0dGluZ3NFcnJvckhhbmRsZXIoZXJyLCAnRmFpbGVkIHRvIG1vZGlmeSBsb2FkIG9yZGVyIGZpbGUnKSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgb25Qcm9maWxlV2lsbENoYW5nZSA9IChhcGk6IHR5cGVzLklFeHRlbnNpb25BcGkpID0+IHtcclxuICByZXR1cm4gYXN5bmMgKHByb2ZpbGVJZDogc3RyaW5nKSA9PiB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IGFwaS5nZXRTdGF0ZSgpO1xyXG4gICAgY29uc3QgcHJvZmlsZSA9IHNlbGVjdG9ycy5wcm9maWxlQnlJZChzdGF0ZSwgcHJvZmlsZUlkKTtcclxuICAgIGlmIChwcm9maWxlPy5nYW1lSWQgIT09IEdBTUVfSUQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHByaW9yaXR5VHlwZSA9IHV0aWwuZ2V0U2FmZShzdGF0ZSwgZ2V0UHJpb3JpdHlUeXBlQnJhbmNoKCksICdwcmVmaXgtYmFzZWQnKTtcclxuICAgIGFwaS5zdG9yZS5kaXNwYXRjaChzZXRQcmlvcml0eVR5cGUocHJpb3JpdHlUeXBlKSk7XHJcblxyXG4gICAgY29uc3QgbGFzdFByb2ZJZCA9IHNlbGVjdG9ycy5sYXN0QWN0aXZlUHJvZmlsZUZvckdhbWUoc3RhdGUsIHByb2ZpbGUuZ2FtZUlkKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHN0b3JlVG9Qcm9maWxlKGFwaSwgbGFzdFByb2ZJZClcclxuICAgICAgICAudGhlbigoKSA9PiByZXN0b3JlRnJvbVByb2ZpbGUoYXBpLCBwcm9maWxlLmlkKSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgdXRpbC5Vc2VyQ2FuY2VsZWQpKSB7XHJcbiAgICAgICAgYXBpLnNob3dFcnJvck5vdGlmaWNhdGlvbignRmFpbGVkIHRvIHN0b3JlIHByb2ZpbGUgc3BlY2lmaWMgbWVyZ2VkIGl0ZW1zJywgZXJyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IG9uU2V0dGluZ3NDaGFuZ2UgPSAoYXBpOiB0eXBlcy5JRXh0ZW5zaW9uQXBpLCBwcmlvcml0eU1hbmFnZXI6IFByaW9yaXR5TWFuYWdlcikgPT4ge1xyXG4gIHJldHVybiBhc3luYyAocHJldjogc3RyaW5nLCBjdXJyZW50OiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHN0YXRlID0gYXBpLmdldFN0YXRlKCk7XHJcbiAgICBjb25zdCBhY3RpdmVQcm9maWxlID0gc2VsZWN0b3JzLmFjdGl2ZVByb2ZpbGUoc3RhdGUpO1xyXG4gICAgaWYgKGFjdGl2ZVByb2ZpbGU/LmdhbWVJZCAhPT0gR0FNRV9JRCB8fCBwcmlvcml0eU1hbmFnZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcHJpb3JpdHlUeXBlID0gdXRpbC5nZXRTYWZlKHN0YXRlLCBnZXRQcmlvcml0eVR5cGVCcmFuY2goKSwgJ3ByZWZpeC1iYXNlZCcpO1xyXG4gICAgcHJpb3JpdHlNYW5hZ2VyLnByaW9yaXR5VHlwZSA9IHByaW9yaXR5VHlwZTtcclxuICAgIGFwaS5ldmVudHMub24oJ3B1cmdlLW1vZHMnLCAoKSA9PiB7XHJcbiAgICAgIEluaVN0cnVjdHVyZS5nZXRJbnN0YW5jZSgpLnJldmVydExPRmlsZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTY3JpcHRNZXJnZXJUb29sKGFwaSkge1xyXG4gIGNvbnN0IHN0YXRlID0gYXBpLnN0b3JlLmdldFN0YXRlKCk7XHJcbiAgY29uc3Qgc2NyaXB0TWVyZ2VyID0gdXRpbC5nZXRTYWZlKHN0YXRlLFxyXG4gICAgWydzZXR0aW5ncycsICdnYW1lTW9kZScsICdkaXNjb3ZlcmVkJywgR0FNRV9JRCwgJ3Rvb2xzJywgU0NSSVBUX01FUkdFUl9JRF0sIHVuZGVmaW5lZCk7XHJcbiAgaWYgKCEhc2NyaXB0TWVyZ2VyPy5wYXRoKSB7XHJcbiAgICByZXR1cm4gc2NyaXB0TWVyZ2VyO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHVuZGVmaW5lZDtcclxufVxyXG5cclxuZnVuY3Rpb24gcnVuU2NyaXB0TWVyZ2VyKGFwaSkge1xyXG4gIGNvbnN0IHRvb2wgPSBnZXRTY3JpcHRNZXJnZXJUb29sKGFwaSk7XHJcbiAgaWYgKHRvb2w/LnBhdGggPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5ub3RpZnlNaXNzaW5nU2NyaXB0TWVyZ2VyKGFwaSk7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYXBpLnJ1bkV4ZWN1dGFibGUodG9vbC5wYXRoLCBbXSwgeyBzdWdnZXN0RGVwbG95OiB0cnVlIH0pXHJcbiAgICAuY2F0Y2goZXJyID0+IGFwaS5zaG93RXJyb3JOb3RpZmljYXRpb24oJ0ZhaWxlZCB0byBydW4gdG9vbCcsIGVycixcclxuICAgICAgeyBhbGxvd1JlcG9ydDogWydFUEVSTScsICdFQUNDRVNTJywgJ0VOT0VOVCddLmluZGV4T2YoZXJyLmNvZGUpICE9PSAtMSB9KSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHF1ZXJ5U2NyaXB0TWVyZ2UoYXBpOiB0eXBlcy5JRXh0ZW5zaW9uQXBpLCByZWFzb246IHN0cmluZykge1xyXG4gIGNvbnN0IHN0YXRlID0gYXBpLnN0b3JlLmdldFN0YXRlKCk7XHJcbiAgY29uc3QgdCA9IGFwaS50cmFuc2xhdGU7XHJcbiAgY29uc3Qgc2NyaXB0TWVyZ2VyVG9vbCA9IHV0aWwuZ2V0U2FmZShzdGF0ZSwgWydzZXR0aW5ncycsICdnYW1lTW9kZScsICdkaXNjb3ZlcmVkJywgR0FNRV9JRCwgJ3Rvb2xzJywgU0NSSVBUX01FUkdFUl9JRF0sIHVuZGVmaW5lZCk7XHJcbiAgaWYgKCEhc2NyaXB0TWVyZ2VyVG9vbD8ucGF0aCkge1xyXG4gICAgYXBpLnNlbmROb3RpZmljYXRpb24oe1xyXG4gICAgICBpZDogJ3dpdGNoZXIzLW1lcmdlJyxcclxuICAgICAgdHlwZTogJ3dhcm5pbmcnLFxyXG4gICAgICBtZXNzYWdlOiB0KCdXaXRjaGVyIFNjcmlwdCBtZXJnZXIgbWF5IG5lZWQgdG8gYmUgZXhlY3V0ZWQnLCB7IG5zOiBJMThOX05BTUVTUEFDRSB9KSxcclxuICAgICAgYWxsb3dTdXBwcmVzczogdHJ1ZSxcclxuICAgICAgYWN0aW9uczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpdGxlOiAnTW9yZScsXHJcbiAgICAgICAgICBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgICAgYXBpLnNob3dEaWFsb2coJ2luZm8nLCAnV2l0Y2hlciAzJywge1xyXG4gICAgICAgICAgICAgIHRleHQ6IHJlYXNvbixcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgIHsgbGFiZWw6ICdDbG9zZScgfSxcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGl0bGU6ICdSdW4gdG9vbCcsXHJcbiAgICAgICAgICBhY3Rpb246IGRpc21pc3MgPT4ge1xyXG4gICAgICAgICAgICBydW5TY3JpcHRNZXJnZXIoYXBpKTtcclxuICAgICAgICAgICAgZGlzbWlzcygpO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMubm90aWZ5TWlzc2luZ1NjcmlwdE1lcmdlcihhcGkpO1xyXG4gIH1cclxufSJdfQ==