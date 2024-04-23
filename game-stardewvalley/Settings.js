"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_i18next_1 = require("react-i18next");
const react_redux_1 = require("react-redux");
const vortex_api_1 = require("vortex-api");
const actions_1 = require("./actions");
const common_1 = require("./common");
function Settings() {
    const sdvSettings = (0, react_redux_1.useSelector)((state) => state.settings['SDV']);
    const { useRecommendations, mergeConfigs } = sdvSettings;
    const store = (0, react_redux_1.useStore)();
    const { profileId } = (0, react_redux_1.useSelector)(mapStateToProps);
    const setUseRecommendations = react_1.default.useCallback((enabled) => {
        store.dispatch((0, actions_1.setRecommendations)(enabled));
    }, []);
    const setMergeConfigSetting = react_1.default.useCallback((enabled) => {
        store.dispatch((0, actions_1.setMergeConfigs)(profileId, enabled));
    }, [profileId]);
    const { t } = (0, react_i18next_1.useTranslation)();
    return (react_1.default.createElement("form", null,
        react_1.default.createElement(react_bootstrap_1.FormGroup, { controlId: 'default-enable' },
            react_1.default.createElement(react_bootstrap_1.Panel, null,
                react_1.default.createElement(react_bootstrap_1.Panel.Body, null,
                    react_1.default.createElement(react_bootstrap_1.ControlLabel, null, t('Stardew Valley')),
                    react_1.default.createElement(vortex_api_1.Toggle, { checked: useRecommendations, onToggle: setUseRecommendations }, t('Use recommendations from the mod manifests')),
                    react_1.default.createElement(vortex_api_1.Toggle, { checked: mergeConfigs, onToggle: setMergeConfigSetting },
                        t('Manage SDV mod configuration files'),
                        react_1.default.createElement(vortex_api_1.More, { id: 'sdv_mod_configuration', name: 'SDV Mod Configuration' }, t('Vortex by default is configured to attempt to pull-in newly created files (mod configuration json files for example) '
                            + 'created externally (by the game itself or tools) into their respective mod folders.\n\n'
                            + 'Unfortunately the configuration files are lost during mod updates when using this method.\n\n'
                            + 'Toggling this functionality creates a separate mod configuration "override" folder where all of your mod configuration files '
                            + 'will be stored. This allows you to manage your mod configuration files on their own, regardless of mod updates. '))),
                    react_1.default.createElement(react_bootstrap_1.HelpBlock, null, t('If checked, when you install a mod for Stardew Valley you may get '
                        + 'suggestions for installing further mods, required or recommended by it.'
                        + 'This information could be wrong or incomplete so please carefully '
                        + 'consider before accepting them.')))))));
}
function mapStateToProps(state) {
    const profileId = vortex_api_1.selectors.lastActiveProfileForGame(state, common_1.GAME_ID);
    return {
        profileId,
    };
}
exports.default = Settings;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXR0aW5ncy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBMEI7QUFDMUIscURBQTRFO0FBQzVFLGlEQUErQztBQUMvQyw2Q0FBb0Q7QUFDcEQsMkNBQTREO0FBQzVELHVDQUFnRTtBQUNoRSxxQ0FBbUM7QUFNbkMsU0FBUyxRQUFRO0lBQ2YsTUFBTSxXQUFXLEdBQUcsSUFBQSx5QkFBVyxFQUFDLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxHQUFHLFdBQVcsQ0FBQztJQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFBLHNCQUFRLEdBQUUsQ0FBQztJQUN6QixNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBQSx5QkFBVyxFQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRW5ELE1BQU0scUJBQXFCLEdBQUcsZUFBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQWdCLEVBQUUsRUFBRTtRQUNuRSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUEsNEJBQWtCLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFUCxNQUFNLHFCQUFxQixHQUFHLGVBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFnQixFQUFFLEVBQUU7UUFDbkUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFBLHlCQUFlLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUVoQixNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBQSw4QkFBYyxHQUFFLENBQUM7SUFFL0IsT0FBTyxDQUNMO1FBQ0UsOEJBQUMsMkJBQVMsSUFBQyxTQUFTLEVBQUMsZ0JBQWdCO1lBQ25DLDhCQUFDLHVCQUFLO2dCQUNKLDhCQUFDLHVCQUFLLENBQUMsSUFBSTtvQkFDVCw4QkFBQyw4QkFBWSxRQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFnQjtvQkFDbEQsOEJBQUMsbUJBQU0sSUFDTCxPQUFPLEVBQUUsa0JBQWtCLEVBQzNCLFFBQVEsRUFBRSxxQkFBcUIsSUFFOUIsQ0FBQyxDQUFDLDRDQUE0QyxDQUFDLENBQ3pDO29CQUNULDhCQUFDLG1CQUFNLElBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUscUJBQXFCO3dCQUMzRCxDQUFDLENBQUMsb0NBQW9DLENBQUM7d0JBQ3hDLDhCQUFDLGlCQUFJLElBQUMsRUFBRSxFQUFDLHVCQUF1QixFQUFDLElBQUksRUFBQyx1QkFBdUIsSUFDMUQsQ0FBQyxDQUFDLHVIQUF1SDs4QkFDdkgseUZBQXlGOzhCQUN6RiwrRkFBK0Y7OEJBQy9GLCtIQUErSDs4QkFDL0gsa0hBQWtILENBQ3BILENBQ0ksQ0FDQTtvQkFDVCw4QkFBQywyQkFBUyxRQUNQLENBQUMsQ0FBQyxvRUFBb0U7MEJBQ25FLHlFQUF5RTswQkFDekUsb0VBQW9FOzBCQUNwRSxpQ0FBaUMsQ0FBQyxDQUM1QixDQUNELENBQ1AsQ0FDRSxDQUNQLENBQ1IsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxLQUFtQjtJQUMxQyxNQUFNLFNBQVMsR0FBRyxzQkFBUyxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxnQkFBTyxDQUFDLENBQUM7SUFDckUsT0FBTztRQUNMLFNBQVM7S0FDVixDQUFBO0FBQ0gsQ0FBQztBQUVELGtCQUFlLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IENvbnRyb2xMYWJlbCwgRm9ybUdyb3VwLCBIZWxwQmxvY2ssIFBhbmVsIH0gZnJvbSAncmVhY3QtYm9vdHN0cmFwJztcclxuaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdyZWFjdC1pMThuZXh0JztcclxuaW1wb3J0IHsgdXNlU2VsZWN0b3IsIHVzZVN0b3JlIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xyXG5pbXBvcnQgeyBUb2dnbGUsIE1vcmUsIHNlbGVjdG9ycywgdHlwZXMgfSBmcm9tICd2b3J0ZXgtYXBpJztcclxuaW1wb3J0IHsgc2V0UmVjb21tZW5kYXRpb25zLCBzZXRNZXJnZUNvbmZpZ3MgfSBmcm9tICcuL2FjdGlvbnMnO1xyXG5pbXBvcnQgeyBHQU1FX0lEIH0gZnJvbSAnLi9jb21tb24nO1xyXG5cclxuaW50ZXJmYWNlIElDb25uZWN0ZWRQcm9wcyB7XHJcbiAgcHJvZmlsZUlkOiBzdHJpbmc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFNldHRpbmdzKCkge1xyXG4gIGNvbnN0IHNkdlNldHRpbmdzID0gdXNlU2VsZWN0b3IoKHN0YXRlOiBhbnkpID0+IHN0YXRlLnNldHRpbmdzWydTRFYnXSk7XHJcbiAgY29uc3QgeyB1c2VSZWNvbW1lbmRhdGlvbnMsIG1lcmdlQ29uZmlncyB9ID0gc2R2U2V0dGluZ3M7XHJcbiAgY29uc3Qgc3RvcmUgPSB1c2VTdG9yZSgpO1xyXG4gIGNvbnN0IHsgcHJvZmlsZUlkIH0gPSB1c2VTZWxlY3RvcihtYXBTdGF0ZVRvUHJvcHMpO1xyXG5cclxuICBjb25zdCBzZXRVc2VSZWNvbW1lbmRhdGlvbnMgPSBSZWFjdC51c2VDYWxsYmFjaygoZW5hYmxlZDogYm9vbGVhbikgPT4ge1xyXG4gICAgc3RvcmUuZGlzcGF0Y2goc2V0UmVjb21tZW5kYXRpb25zKGVuYWJsZWQpKTtcclxuICB9LCBbXSk7XHJcblxyXG4gIGNvbnN0IHNldE1lcmdlQ29uZmlnU2V0dGluZyA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbmFibGVkOiBib29sZWFuKSA9PiB7XHJcbiAgICBzdG9yZS5kaXNwYXRjaChzZXRNZXJnZUNvbmZpZ3MocHJvZmlsZUlkLCBlbmFibGVkKSk7XHJcbiAgfSwgW3Byb2ZpbGVJZF0pO1xyXG4gIFxyXG4gIGNvbnN0IHsgdCB9ID0gdXNlVHJhbnNsYXRpb24oKTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxmb3JtPlxyXG4gICAgICA8Rm9ybUdyb3VwIGNvbnRyb2xJZD0nZGVmYXVsdC1lbmFibGUnPlxyXG4gICAgICAgIDxQYW5lbD5cclxuICAgICAgICAgIDxQYW5lbC5Cb2R5PlxyXG4gICAgICAgICAgICA8Q29udHJvbExhYmVsPnt0KCdTdGFyZGV3IFZhbGxleScpfTwvQ29udHJvbExhYmVsPlxyXG4gICAgICAgICAgICA8VG9nZ2xlXHJcbiAgICAgICAgICAgICAgY2hlY2tlZD17dXNlUmVjb21tZW5kYXRpb25zfVxyXG4gICAgICAgICAgICAgIG9uVG9nZ2xlPXtzZXRVc2VSZWNvbW1lbmRhdGlvbnN9XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICB7dCgnVXNlIHJlY29tbWVuZGF0aW9ucyBmcm9tIHRoZSBtb2QgbWFuaWZlc3RzJyl9XHJcbiAgICAgICAgICAgIDwvVG9nZ2xlPlxyXG4gICAgICAgICAgICA8VG9nZ2xlIGNoZWNrZWQ9e21lcmdlQ29uZmlnc30gb25Ub2dnbGU9e3NldE1lcmdlQ29uZmlnU2V0dGluZ30+XHJcbiAgICAgICAgICAgICAge3QoJ01hbmFnZSBTRFYgbW9kIGNvbmZpZ3VyYXRpb24gZmlsZXMnKX1cclxuICAgICAgICAgICAgICA8TW9yZSBpZD0nc2R2X21vZF9jb25maWd1cmF0aW9uJyBuYW1lPSdTRFYgTW9kIENvbmZpZ3VyYXRpb24nPlxyXG4gICAgICAgICAgICAgICAge3QoJ1ZvcnRleCBieSBkZWZhdWx0IGlzIGNvbmZpZ3VyZWQgdG8gYXR0ZW1wdCB0byBwdWxsLWluIG5ld2x5IGNyZWF0ZWQgZmlsZXMgKG1vZCBjb25maWd1cmF0aW9uIGpzb24gZmlsZXMgZm9yIGV4YW1wbGUpICdcclxuICAgICAgICAgICAgICAgICArICdjcmVhdGVkIGV4dGVybmFsbHkgKGJ5IHRoZSBnYW1lIGl0c2VsZiBvciB0b29scykgaW50byB0aGVpciByZXNwZWN0aXZlIG1vZCBmb2xkZXJzLlxcblxcbidcclxuICAgICAgICAgICAgICAgICArICdVbmZvcnR1bmF0ZWx5IHRoZSBjb25maWd1cmF0aW9uIGZpbGVzIGFyZSBsb3N0IGR1cmluZyBtb2QgdXBkYXRlcyB3aGVuIHVzaW5nIHRoaXMgbWV0aG9kLlxcblxcbidcclxuICAgICAgICAgICAgICAgICArICdUb2dnbGluZyB0aGlzIGZ1bmN0aW9uYWxpdHkgY3JlYXRlcyBhIHNlcGFyYXRlIG1vZCBjb25maWd1cmF0aW9uIFwib3ZlcnJpZGVcIiBmb2xkZXIgd2hlcmUgYWxsIG9mIHlvdXIgbW9kIGNvbmZpZ3VyYXRpb24gZmlsZXMgJ1xyXG4gICAgICAgICAgICAgICAgICsgJ3dpbGwgYmUgc3RvcmVkLiBUaGlzIGFsbG93cyB5b3UgdG8gbWFuYWdlIHlvdXIgbW9kIGNvbmZpZ3VyYXRpb24gZmlsZXMgb24gdGhlaXIgb3duLCByZWdhcmRsZXNzIG9mIG1vZCB1cGRhdGVzLiAnXHJcbiAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgIDwvTW9yZT5cclxuICAgICAgICAgICAgPC9Ub2dnbGU+XHJcbiAgICAgICAgICAgIDxIZWxwQmxvY2s+XHJcbiAgICAgICAgICAgICAge3QoJ0lmIGNoZWNrZWQsIHdoZW4geW91IGluc3RhbGwgYSBtb2QgZm9yIFN0YXJkZXcgVmFsbGV5IHlvdSBtYXkgZ2V0ICdcclxuICAgICAgICAgICAgICAgICsgJ3N1Z2dlc3Rpb25zIGZvciBpbnN0YWxsaW5nIGZ1cnRoZXIgbW9kcywgcmVxdWlyZWQgb3IgcmVjb21tZW5kZWQgYnkgaXQuJ1xyXG4gICAgICAgICAgICAgICAgKyAnVGhpcyBpbmZvcm1hdGlvbiBjb3VsZCBiZSB3cm9uZyBvciBpbmNvbXBsZXRlIHNvIHBsZWFzZSBjYXJlZnVsbHkgJ1xyXG4gICAgICAgICAgICAgICAgKyAnY29uc2lkZXIgYmVmb3JlIGFjY2VwdGluZyB0aGVtLicpfVxyXG4gICAgICAgICAgICA8L0hlbHBCbG9jaz5cclxuICAgICAgICAgIDwvUGFuZWwuQm9keT5cclxuICAgICAgICA8L1BhbmVsPlxyXG4gICAgICA8L0Zvcm1Hcm91cD5cclxuICAgIDwvZm9ybT5cclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXBTdGF0ZVRvUHJvcHMoc3RhdGU6IHR5cGVzLklTdGF0ZSk6IElDb25uZWN0ZWRQcm9wcyB7XHJcbiAgY29uc3QgcHJvZmlsZUlkID0gc2VsZWN0b3JzLmxhc3RBY3RpdmVQcm9maWxlRm9yR2FtZShzdGF0ZSwgR0FNRV9JRCk7XHJcbiAgcmV0dXJuIHtcclxuICAgIHByb2ZpbGVJZCxcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNldHRpbmdzO1xyXG4iXX0=