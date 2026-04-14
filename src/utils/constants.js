// Storage keys removed — data now persisted via backend API

export const STATUS = {
    ACTIVE: 'active',
    DISABLED: 'disabled',
    SUCCESS: 'success',
    FAILURE: 'failure'
};

export const LOG_OPERATIONS = {
    CREATE_PQC_KEY: 'create_pqc_key',
    UPDATE_PQC_KEY: 'update_pqc_key',
    CREATE_AUTH_KEY: 'create_auth_key',
    UPDATE_AUTH_KEY: 'update_auth_key',
    CREATE_POLICY: 'create_policy',
    UPDATE_POLICY: 'update_policy'
};

export const TABLE_LAYOUTS = {
    CARDS: 'cards',
    SCROLL: 'scroll'
};
