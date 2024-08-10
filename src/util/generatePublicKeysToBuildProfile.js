const fs = require('fs');
const path = require('path');
const JSON5 = require("json5");
const { HM_PROJECT_PATH } = require('./common');

/*
 * publicKeys中的key value，写入到鸿蒙工程中build-profile.json5
 *
*/ 
module.exports.publicKeysToBuildProfile = (publicKeys) => {
    const build_profile_path = path.join(HM_PROJECT_PATH, 'build-profile.json5');
    if (fs.existsSync(build_profile_path)) {
        let build_config = JSON5.parse(fs.readFileSync(build_profile_path), 'utf-8');
        let products_config_list = build_config.app.products;
        build_config.app.products = products_config_list.map(item => {
            return {
                ...item, "buildOption": {
                    "arkOptions": {
                        "buildProfileFields": { ...publicKeys }
                    }
                }
            }
        });
        fs.writeFileSync(
            build_profile_path,
            JSON5.stringify(build_config, null, 2)
        );
        return true;
    }
    return false;    
}