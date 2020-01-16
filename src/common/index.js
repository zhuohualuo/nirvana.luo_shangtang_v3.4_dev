 /*
  common function for views
 */

/* nginx端口配置 */
export const Nginx = {
    common: {
        port: process.env.common_port || 5100
    },
    api: {
        port: process.env.api_port || 5400
    },
    perf: {
        port: process.env.perf_port || 5600
    },
    precision: {
        port: process.env.precision_port || 5200
    }
}

import { getProjectList, getVersionList, getModuleList } from '@/api/project';
import { getInterfaceList, getCaseTypeList } from '@/api/case';
import { getConfigList, getKeyList } from '@/api/config';

export function FilterProject(item){
    getProjectList().then((response)=>{
        let list = [];
        for(let pro of response.data.projects){
            list.push({label: pro.name, value: pro.id})
        }
        item.optionList = list;
    }).catch(function (err) {
    });
}

export function FilterVersion(item, form){
    if(form.project_id){
        getVersionList({project_id: form.project_id}).then((response) => {
            // console.log(response)
            let list = [];
            for(let version of response.data.version){
                list.push({label: version.version, value: version.id})
            }
            item.optionList = list;
        }).catch(function (err) {
        });
    }
}

export function FilterModule(item, form){
    if(form.version_id){
        getModuleList({
            project_id: form.project_id,
            version_id: form.version_id
        }).then((response) => {
            // console.log(response)
            let list = [];
            for(let module of response.data.module){
                list.push({label: module, value: module})
            }
            item.optionList = list;
        }).catch(function (err) {
        });
    }
}

export function FilterRecord(item, form){
    if(form.module){
        getInterfaceList({
            project_id: form.project_id,
            version_id: form.version_id,
            module: form.module
        }).then(function (response) {
            // console.log(response)
            let list = [];
            for(let record of response.data.api_records){
                list.push({label: record.name, value: record.id})
            }
            item.optionList = list;
        }).catch(function (err) {
        });
    }
}

export function FilterCaseType(item){
    getCaseTypeList().then(function (response){
        // console.log(response)
        let list = [];
        for(let type of response.data.types){
            list.push({label: type.type_name, value: type.id})
        }
        item.optionList = list;
    }).catch(function (err) {
    });
}

export function FilterConfig(item, form){
    if(form.project_id){
        getConfigList({
            project_id: form.project_id,
            version_id: form.version_id,
            module: form.module,
        }).then(function (response) {
            // console.log(response)
            let list = [];
            for(let config of response.data.keys){
                list.push({label: config.cfg_name, value: config.id})
            }
            item.optionList = list;
        }).catch(function (err) {
        });
    }
}

export function FilterKey(item, form){
    if(form.project_id){
        getKeyList({
            project_id: form.project_id,
        }).then(function (response) {
            // console.log(response)
            let list = [];
            for(let key of response.data.keys){
                list.push({label: key.name, value: key.name, desc: key.description})
            }
            item.optionList = list;
        }).catch(function (err) {
        });
    }
}
