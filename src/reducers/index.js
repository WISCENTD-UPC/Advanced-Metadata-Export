import blacklist from './blacklistReducer';
import d2 from './d2Reducer';
import dialog from './dialogReducer';
import grid from './gridReducer';
import loading from './loadingReducer';
import settings from './settingsReducer';

const index = (state = {}, action) => {
    return {
        blacklist: blacklist(state.blacklist, {...action, d2: state.d2}),
        d2: d2(state.d2, action),
        dialog: dialog(state.dialog, action),
        grid: grid(state.grid, {...action, d2: state.d2, settings: state.settings, blacklist: state.blacklist}),
        loading: loading(state.loading, action),
        settings: settings(state.settings, action)
    };
};

export default index;