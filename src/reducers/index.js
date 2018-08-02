import d2 from './d2Reducer';
import database from './databaseReducer';
import loading from "./loadingReducer";
import grid from './gridReducer';
import dialog from "./dialogReducer";
import settings from "./settingsReducer";

const index = (state = {}, action: Action) => {
    return {
        d2: d2(state.d2, action),
        database: database(state.database, action),
        loading: loading(state.loading, action),
        dialog: dialog(state.dialog, action),
        settings: settings(state.settings, action),
        grid: grid(state.grid, {...action, d2: state.d2, database: state.database, settings: state.settings})
    };
};

export default index;