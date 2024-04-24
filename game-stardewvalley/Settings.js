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
                    react_1.default.createElement(vortex_api_1.Toggle, { checked: useRecommendations, onToggle: setUseRecommendations, disabled: true }, t('Use recommendations from the mod manifests')),
                    react_1.default.createElement(vortex_api_1.More, { id: 'sdv_use_recommendations', name: 'SDV Use Recommendations' }, t('If checked, when you install a mod for Stardew Valley you may get '
                        + 'suggestions for installing further mods, required or recommended by it.'
                        + 'This information could be wrong or incomplete so please carefully '
                        + 'consider before accepting them.')),
                    react_1.default.createElement(vortex_api_1.Toggle, { checked: mergeConfigs, onToggle: setMergeConfigSetting },
                        t('Manage SDV mod configuration files'),
                        react_1.default.createElement(vortex_api_1.More, { id: 'sdv_mod_configuration', name: 'SDV Mod Configuration' }, t('Vortex by default is configured to attempt to pull-in newly created files (mod configuration json files for example) '
                            + 'created externally (by the game itself or tools) into their respective mod folders.\n\n'
                            + 'Unfortunately the configuration files are lost during mod updates when using this method.\n\n'
                            + 'Toggling this functionality creates a separate mod configuration "override" folder where all of your mod configuration files '
                            + 'will be stored. This allows you to manage your mod configuration files on their own, regardless of mod updates. '))))))));
}
function mapStateToProps(state) {
    const profileId = vortex_api_1.selectors.lastActiveProfileForGame(state, common_1.GAME_ID);
    return {
        profileId,
    };
}
exports.default = Settings;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXR0aW5ncy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBMEI7QUFDMUIscURBQTRFO0FBQzVFLGlEQUErQztBQUMvQyw2Q0FBb0Q7QUFDcEQsMkNBQTREO0FBQzVELHVDQUFnRTtBQUNoRSxxQ0FBbUM7QUFNbkMsU0FBUyxRQUFRO0lBQ2YsTUFBTSxXQUFXLEdBQUcsSUFBQSx5QkFBVyxFQUFDLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxHQUFHLFdBQVcsQ0FBQztJQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFBLHNCQUFRLEdBQUUsQ0FBQztJQUN6QixNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBQSx5QkFBVyxFQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRW5ELE1BQU0scUJBQXFCLEdBQUcsZUFBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQWdCLEVBQUUsRUFBRTtRQUNuRSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUEsNEJBQWtCLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFUCxNQUFNLHFCQUFxQixHQUFHLGVBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFnQixFQUFFLEVBQUU7UUFDbkUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFBLHlCQUFlLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUVoQixNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBQSw4QkFBYyxHQUFFLENBQUM7SUFFL0IsT0FBTyxDQUNMO1FBQ0UsOEJBQUMsMkJBQVMsSUFBQyxTQUFTLEVBQUMsZ0JBQWdCO1lBQ25DLDhCQUFDLHVCQUFLO2dCQUNKLDhCQUFDLHVCQUFLLENBQUMsSUFBSTtvQkFDVCw4QkFBQyw4QkFBWSxRQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFnQjtvQkFDbEQsOEJBQUMsbUJBQU0sSUFDTCxPQUFPLEVBQUUsa0JBQWtCLEVBQzNCLFFBQVEsRUFBRSxxQkFBcUIsRUFDL0IsUUFBUSxFQUFFLElBQUksSUFFYixDQUFDLENBQUMsNENBQTRDLENBQUMsQ0FDekM7b0JBQ1QsOEJBQUMsaUJBQUksSUFBQyxFQUFFLEVBQUMseUJBQXlCLEVBQUMsSUFBSSxFQUFDLHlCQUF5QixJQUM5RCxDQUFDLENBQUMsb0VBQW9FOzBCQUNuRSx5RUFBeUU7MEJBQ3pFLG9FQUFvRTswQkFDcEUsaUNBQWlDLENBQUMsQ0FDakM7b0JBQ1AsOEJBQUMsbUJBQU0sSUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxxQkFBcUI7d0JBQzNELENBQUMsQ0FBQyxvQ0FBb0MsQ0FBQzt3QkFDeEMsOEJBQUMsaUJBQUksSUFBQyxFQUFFLEVBQUMsdUJBQXVCLEVBQUMsSUFBSSxFQUFDLHVCQUF1QixJQUMxRCxDQUFDLENBQUMsdUhBQXVIOzhCQUN0SCx5RkFBeUY7OEJBQ3pGLCtGQUErRjs4QkFDL0YsK0hBQStIOzhCQUMvSCxrSEFBa0gsQ0FDckgsQ0FDSSxDQUNBLENBQ0UsQ0FDUCxDQUNFLENBQ1AsQ0FDUixDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLEtBQW1CO0lBQzFDLE1BQU0sU0FBUyxHQUFHLHNCQUFTLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLGdCQUFPLENBQUMsQ0FBQztJQUNyRSxPQUFPO1FBQ0wsU0FBUztLQUNWLENBQUE7QUFDSCxDQUFDO0FBRUQsa0JBQWUsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgQ29udHJvbExhYmVsLCBGb3JtR3JvdXAsIEhlbHBCbG9jaywgUGFuZWwgfSBmcm9tICdyZWFjdC1ib290c3RyYXAnO1xyXG5pbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ3JlYWN0LWkxOG5leHQnO1xyXG5pbXBvcnQgeyB1c2VTZWxlY3RvciwgdXNlU3RvcmUgfSBmcm9tICdyZWFjdC1yZWR1eCc7XHJcbmltcG9ydCB7IFRvZ2dsZSwgTW9yZSwgc2VsZWN0b3JzLCB0eXBlcyB9IGZyb20gJ3ZvcnRleC1hcGknO1xyXG5pbXBvcnQgeyBzZXRSZWNvbW1lbmRhdGlvbnMsIHNldE1lcmdlQ29uZmlncyB9IGZyb20gJy4vYWN0aW9ucyc7XHJcbmltcG9ydCB7IEdBTUVfSUQgfSBmcm9tICcuL2NvbW1vbic7XHJcblxyXG5pbnRlcmZhY2UgSUNvbm5lY3RlZFByb3BzIHtcclxuICBwcm9maWxlSWQ6IHN0cmluZztcclxufVxyXG5cclxuZnVuY3Rpb24gU2V0dGluZ3MoKSB7XHJcbiAgY29uc3Qgc2R2U2V0dGluZ3MgPSB1c2VTZWxlY3Rvcigoc3RhdGU6IGFueSkgPT4gc3RhdGUuc2V0dGluZ3NbJ1NEViddKTtcclxuICBjb25zdCB7IHVzZVJlY29tbWVuZGF0aW9ucywgbWVyZ2VDb25maWdzIH0gPSBzZHZTZXR0aW5ncztcclxuICBjb25zdCBzdG9yZSA9IHVzZVN0b3JlKCk7XHJcbiAgY29uc3QgeyBwcm9maWxlSWQgfSA9IHVzZVNlbGVjdG9yKG1hcFN0YXRlVG9Qcm9wcyk7XHJcblxyXG4gIGNvbnN0IHNldFVzZVJlY29tbWVuZGF0aW9ucyA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbmFibGVkOiBib29sZWFuKSA9PiB7XHJcbiAgICBzdG9yZS5kaXNwYXRjaChzZXRSZWNvbW1lbmRhdGlvbnMoZW5hYmxlZCkpO1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgY29uc3Qgc2V0TWVyZ2VDb25maWdTZXR0aW5nID0gUmVhY3QudXNlQ2FsbGJhY2soKGVuYWJsZWQ6IGJvb2xlYW4pID0+IHtcclxuICAgIHN0b3JlLmRpc3BhdGNoKHNldE1lcmdlQ29uZmlncyhwcm9maWxlSWQsIGVuYWJsZWQpKTtcclxuICB9LCBbcHJvZmlsZUlkXSk7XHJcblxyXG4gIGNvbnN0IHsgdCB9ID0gdXNlVHJhbnNsYXRpb24oKTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxmb3JtPlxyXG4gICAgICA8Rm9ybUdyb3VwIGNvbnRyb2xJZD0nZGVmYXVsdC1lbmFibGUnPlxyXG4gICAgICAgIDxQYW5lbD5cclxuICAgICAgICAgIDxQYW5lbC5Cb2R5PlxyXG4gICAgICAgICAgICA8Q29udHJvbExhYmVsPnt0KCdTdGFyZGV3IFZhbGxleScpfTwvQ29udHJvbExhYmVsPlxyXG4gICAgICAgICAgICA8VG9nZ2xlXHJcbiAgICAgICAgICAgICAgY2hlY2tlZD17dXNlUmVjb21tZW5kYXRpb25zfVxyXG4gICAgICAgICAgICAgIG9uVG9nZ2xlPXtzZXRVc2VSZWNvbW1lbmRhdGlvbnN9XHJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RydWV9XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICB7dCgnVXNlIHJlY29tbWVuZGF0aW9ucyBmcm9tIHRoZSBtb2QgbWFuaWZlc3RzJyl9XHJcbiAgICAgICAgICAgIDwvVG9nZ2xlPlxyXG4gICAgICAgICAgICA8TW9yZSBpZD0nc2R2X3VzZV9yZWNvbW1lbmRhdGlvbnMnIG5hbWU9J1NEViBVc2UgUmVjb21tZW5kYXRpb25zJz5cclxuICAgICAgICAgICAgICB7dCgnSWYgY2hlY2tlZCwgd2hlbiB5b3UgaW5zdGFsbCBhIG1vZCBmb3IgU3RhcmRldyBWYWxsZXkgeW91IG1heSBnZXQgJ1xyXG4gICAgICAgICAgICAgICAgKyAnc3VnZ2VzdGlvbnMgZm9yIGluc3RhbGxpbmcgZnVydGhlciBtb2RzLCByZXF1aXJlZCBvciByZWNvbW1lbmRlZCBieSBpdC4nXHJcbiAgICAgICAgICAgICAgICArICdUaGlzIGluZm9ybWF0aW9uIGNvdWxkIGJlIHdyb25nIG9yIGluY29tcGxldGUgc28gcGxlYXNlIGNhcmVmdWxseSAnXHJcbiAgICAgICAgICAgICAgICArICdjb25zaWRlciBiZWZvcmUgYWNjZXB0aW5nIHRoZW0uJyl9XHJcbiAgICAgICAgICAgIDwvTW9yZT5cclxuICAgICAgICAgICAgPFRvZ2dsZSBjaGVja2VkPXttZXJnZUNvbmZpZ3N9IG9uVG9nZ2xlPXtzZXRNZXJnZUNvbmZpZ1NldHRpbmd9PlxyXG4gICAgICAgICAgICAgIHt0KCdNYW5hZ2UgU0RWIG1vZCBjb25maWd1cmF0aW9uIGZpbGVzJyl9XHJcbiAgICAgICAgICAgICAgPE1vcmUgaWQ9J3Nkdl9tb2RfY29uZmlndXJhdGlvbicgbmFtZT0nU0RWIE1vZCBDb25maWd1cmF0aW9uJz5cclxuICAgICAgICAgICAgICAgIHt0KCdWb3J0ZXggYnkgZGVmYXVsdCBpcyBjb25maWd1cmVkIHRvIGF0dGVtcHQgdG8gcHVsbC1pbiBuZXdseSBjcmVhdGVkIGZpbGVzIChtb2QgY29uZmlndXJhdGlvbiBqc29uIGZpbGVzIGZvciBleGFtcGxlKSAnXHJcbiAgICAgICAgICAgICAgICAgICsgJ2NyZWF0ZWQgZXh0ZXJuYWxseSAoYnkgdGhlIGdhbWUgaXRzZWxmIG9yIHRvb2xzKSBpbnRvIHRoZWlyIHJlc3BlY3RpdmUgbW9kIGZvbGRlcnMuXFxuXFxuJ1xyXG4gICAgICAgICAgICAgICAgICArICdVbmZvcnR1bmF0ZWx5IHRoZSBjb25maWd1cmF0aW9uIGZpbGVzIGFyZSBsb3N0IGR1cmluZyBtb2QgdXBkYXRlcyB3aGVuIHVzaW5nIHRoaXMgbWV0aG9kLlxcblxcbidcclxuICAgICAgICAgICAgICAgICAgKyAnVG9nZ2xpbmcgdGhpcyBmdW5jdGlvbmFsaXR5IGNyZWF0ZXMgYSBzZXBhcmF0ZSBtb2QgY29uZmlndXJhdGlvbiBcIm92ZXJyaWRlXCIgZm9sZGVyIHdoZXJlIGFsbCBvZiB5b3VyIG1vZCBjb25maWd1cmF0aW9uIGZpbGVzICdcclxuICAgICAgICAgICAgICAgICAgKyAnd2lsbCBiZSBzdG9yZWQuIFRoaXMgYWxsb3dzIHlvdSB0byBtYW5hZ2UgeW91ciBtb2QgY29uZmlndXJhdGlvbiBmaWxlcyBvbiB0aGVpciBvd24sIHJlZ2FyZGxlc3Mgb2YgbW9kIHVwZGF0ZXMuICdcclxuICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgPC9Nb3JlPlxyXG4gICAgICAgICAgICA8L1RvZ2dsZT5cclxuICAgICAgICAgIDwvUGFuZWwuQm9keT5cclxuICAgICAgICA8L1BhbmVsPlxyXG4gICAgICA8L0Zvcm1Hcm91cD5cclxuICAgIDwvZm9ybT5cclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXBTdGF0ZVRvUHJvcHMoc3RhdGU6IHR5cGVzLklTdGF0ZSk6IElDb25uZWN0ZWRQcm9wcyB7XHJcbiAgY29uc3QgcHJvZmlsZUlkID0gc2VsZWN0b3JzLmxhc3RBY3RpdmVQcm9maWxlRm9yR2FtZShzdGF0ZSwgR0FNRV9JRCk7XHJcbiAgcmV0dXJuIHtcclxuICAgIHByb2ZpbGVJZCxcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNldHRpbmdzO1xyXG4iXX0=