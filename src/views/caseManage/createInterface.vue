<template>
    <div id="content">
        <el-card style="margin-left: 5%;width: 92%;height: 730px">
            <el-form :model="form" :rules="formRule" ref="form1">
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="接口名称" :label-width="formLabelWidth" prop="name">
                            <el-input v-model.trim="form.name" placeholder="请输入接口名称"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                            <el-select v-model="form.project_id"
                                       @change="()=>{form.version_id=[];form.module=''}">
                                <el-option v-for="item in projectList" :value="item.id" :key="item.id" :label="item.name"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="版本" :label-width="formLabelWidth" prop="version_id">
                            <el-select v-model="form.version_id"
                                       :disabled="form.project_id===''"
                                       multiple collapse-tags
                                       @visible-change="getVersion"
                                       @change="()=>{form.module=''}">
                                <el-option v-for="item in versionList" :value="''+item.id" :key="item.id" :label="item.version"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="模块" :label-width="formLabelWidth" prop="module">
                            <el-select v-model="form.module"
                                       :disabled="form.version_id.length===0"
                                       @visible-change="getModule">
                                <el-option v-for="item in moduleList" :value="item" :key="item" :label="item"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <el-form :model="form" ref="form2" style="max-height: 630px;overflow: auto">
                <el-form-item label="接口URL" :label-width="formLabelWidth" prop="url" style="margin-bottom: 7px"
                              :rules="{required: true, message: '请填写接口URL', trigger: 'blur'}">
                    <el-input placeholder="请输入URL" v-model.trim="form.url" style="width: 94%;" @blur="checkURL">
                        <el-select v-model="form.method" slot="prepend" style="width: 180px">
                            <el-option label="GET" value="GET"></el-option>
                            <el-option label="POST" value="POST"></el-option>
                            <el-option label="PUT" value="PUT"></el-option>
                            <el-option label="DELETE" value="DELETE"></el-option>
                            <el-option label="PATCH" value="PATCH"></el-option>
                        </el-select>
                        <el-button slot="append" @click="paramsVisible = !paramsVisible">Params</el-button>
                    </el-input>
                </el-form-item>
                <el-form-item v-for="(item,index) in param" v-show="paramsVisible" style="margin-left: 13%;margin-bottom: 0"
                              :label-width="formLabelWidth" :key="index">
                    <el-input v-model="item.key" :key="'paramKey'+index" style="width: 40%" size="mini" @blur="paramsToPath">
                        <span slot="prepend">Key</span>
                    </el-input>
                    <el-input v-model="item.value" :key="'paramValue'+index" style="width: 40%" size="mini" @blur="paramsToPath">
                        <span slot="prepend">Value</span>
                    </el-input>
                    <el-button v-if="index===0" type="text" @click="addParam" icon="el-icon-circle-plus"
                               style="margin-left: 5%">增加参数</el-button>
                    <el-button v-else type="text" @click="removeParam(index)"
                               size="small" style="color: #F56C6C;margin-left: 3px;text-decoration: underline">删 除</el-button>
                </el-form-item>
                <br/>
                <el-form-item :label-width="formLabelWidth">
                    <el-tabs style="width: 95%" type="card">
                        <el-tab-pane label="请求头">
                            <el-form :model="form" ref="headers">
                                <template v-for="(item,index) in form.headers">
                                    <el-row class="para-form-item">
                                        <el-col :span="6">
                                            <el-form-item :prop="'headers.'+index+'.key'" :key="index+'a'">
                                                <el-input v-model="item.key" :key="'headersKey'+index">
                                                    <span slot="prepend">Key</span>
                                                </el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="6" :offset="1">
                                            <el-form-item :prop="'headers.'+index+'.value'" :key="index+'b'"
                                                          :rules="{validator:validatePass,trigger:'blur'}">
                                                <el-input v-model="item.value" :key="'headersValue'+index">
                                                    <span slot="prepend">Value</span>
                                                </el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="4" :offset="1">
                                            <el-form-item :key="index+'c'">
                                                <el-select v-model="item.type" :key="'headersType'+index" @change="validateFormRule('headers')">
                                                    <el-option label="String" value="string"></el-option>
                                                    <el-option label="Number" value="number"></el-option>
                                                    <el-option label="Boolean" value="boolean"></el-option>
                                                </el-select>
                                            </el-form-item>
                                        </el-col>
                                    <el-button v-if="index===0" @click="addHeader" :key="index+'d'"
                                               type="text" icon="el-icon-circle-plus" style="margin-left: 5%">增加参数</el-button>
                                    <el-button v-else type="text" @click="removeHeader(index)" :key="index+'e'"
                                               style="color: #F56C6C;margin-left: 3px;text-decoration: underline">删 除</el-button>
                                    </el-row>
                                </template>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="请求体">
                            <el-input v-model="bodyContent" key="body"
                                      :disabled="form.method==='GET'"
                                      type="textarea" :rows="20"
                                      style="width: 90%;overflow: auto;"
                                      @change="checkBodyContent">
                            </el-input>
                            <el-button type="info" size="small" @click="JSONformat('bodyContent')" style="margin-left: 8px">格式化JSON</el-button>
                        </el-tab-pane>
                        <el-tab-pane label="校验条件">
                            <el-form :model="form5" ref="form5" :inline="true">
                                <el-button type="primary" @click="addValidate">增加校验Key</el-button>
                                <el-tabs style="margin-top: 15px">
                                    <el-tab-pane v-for="(item,index) in form5.validator" :key="index">
                                        <span slot="label">
                                            <el-input style="width: 90px" v-model="item.key" size="small"></el-input>
                                            <el-button type="text" size="mini" icon="el-icon-close" style="margin: 0;" @click="removeValidate(index)"></el-button>
                                        </span>
                                        <template v-for="(vitem,vindex) in item.condition">
                                            <el-row class="para-form-item" style="width: 90%;margin-left: 8%">
                                                <el-col :span="6">
                                                    <el-form-item :rules="{validator:validateOption,trigger:'change'}"
                                                                  :key="vindex" :prop="'validator.'+index+'.condition.'+vindex+'.option'"
                                                                  label="校验方法">
                                                        <el-select v-model="vitem.option" :key="'validateOption'+vindex">
                                                            <el-option label="等于" value="="></el-option>
                                                            <el-option label="不等于" value="!="></el-option>
                                                            <el-option label="大于" value=">"></el-option>
                                                            <el-option label="小于" value="<"></el-option>
                                                            <el-option label="在...范围内" value="<>"></el-option>
                                                            <el-option label="类型" value="type"></el-option>
                                                            <el-option label="正则表达式" value="re"></el-option>
                                                            <el-option label="长度" value="len"></el-option>
                                                            <el-option label="被包含于" value="in"></el-option>
                                                            <el-option label="不被包含于" value="notin"></el-option>
                                                            <el-option label="包含" value="include"></el-option>
                                                            <el-option label="不包含" value="notinclude"></el-option>
                                                            <el-option label="包含Key" value="includekey"></el-option>
                                                        </el-select>
                                                    </el-form-item>
                                                </el-col>
                                                <el-col :span="6" :offset="1">
                                                    <el-form-item :rules="{validator:validateCondition,trigger:'blur'}"
                                                                  :prop="'validator.'+index+'.condition.'+vindex+'.value'"
                                                                  label="校验值">
                                                        <el-input v-model="vitem.value" :key="'validateValue'+vindex" auto-complete="off"></el-input>
                                                    </el-form-item>
                                                </el-col>
                                                <el-col :span="4">
                                                    <el-form-item>
                                                        <el-select v-model="vitem.type" :key="'validateType'+index" @change="validateFormRule('form5')">
                                                            <el-option label="String" value="string"></el-option>
                                                            <el-option label="Number" value="number"></el-option>
                                                            <el-option label="Boolean" value="boolean"></el-option>
                                                        </el-select>
                                                    </el-form-item>
                                                </el-col>
                                                <el-button v-if="vindex===0" @click="addCondition(index)"
                                                           type="text" icon="el-icon-circle-plus" style="margin-left: 5%">增加校验条件</el-button>
                                                <el-button v-else type="text" @click="removeCondition(index,vindex)"
                                                           style="color: #F56C6C;margin-left: 3px;text-decoration: underline">删 除</el-button>
                                            </el-row>
                                        </template>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="执行中保存项">
                            <div>
                                <el-radio v-model="key.keysType" label="">无</el-radio>
                                <el-radio v-model="key.keysType" label="KeyList">KeyList</el-radio>
                                <el-radio v-model="key.keysType" label="JsonPath">JsonPath</el-radio>
                                <div v-if="key.keysType == 'KeyList'">
                                    <el-input v-model="key.saveKey" key="KeyList"></el-input>
                                    <code class="code_tip">Tip: 填写Key列表，各项用英文逗号区分，如<span style="color: tomato"> 1,2,3 </span></code>
                                </div>
                                <div v-if="key.keysType == 'JsonPath'">
                                    <el-input v-model="key.saveKey" type="textarea" key="JsonPath" :rows="16"></el-input>
                                    <code class="code_tip">Tip: 填写Key的JsonPath，使用JSON格式</code>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="期望响应体(Mock用)">
                            <el-input v-model="expectContent" key="expect"
                                      type="textarea" :rows="20"
                                      style="width: 90%;overflow: auto;"
                                      @change="checkExpect">
                            </el-input>
                            <el-button type="info" size="small" @click="JSONformat('expectContent')" style="margin-left: 8px">格式化JSON</el-button>
                        </el-tab-pane>
                    </el-tabs>
                </el-form-item>
            </el-form>
        </el-card>
        <div class="page-footer-left">
            <el-button type='success' @click='send'>请求测试</el-button>
        </div>
        <div class="page-footer-right">
            <el-button @click='resetForm' :disabled="form.id>0">重 置</el-button>
            <el-button type='primary' @click='commit'>提 交</el-button>
        </div>

        <el-dialog title="测试结果" :visible.sync="testVisible">
            <el-tabs type="card" style="margin-left: 5%;width: 85%;height: 490px">
                <el-tab-pane label="响应消息体">
                    <el-input v-model="response.body" type="textarea" :rows="20"></el-input>
                </el-tab-pane>
                <el-tab-pane label="响应头部">
                    <el-input v-model="response.headers" type="textarea" :rows="20"></el-input>
                </el-tab-pane>
                <el-tab-pane label="校验结果">
                    <el-table :data="response.validate_result">
                        <el-table-column prop="key" label="Key"></el-table-column>
                        <el-table-column prop="real" label="Value"></el-table-column>
                        <el-table-column prop="checker" label="校验失败" :formatter="checkerFormat"></el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="执行中保存结果">
                    <el-table :data="response.savedKey">
                        <el-table-column prop="key" label="Key"></el-table-column>
                        <el-table-column prop="value" label="Value"></el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="testVisible = false">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { sendInterface, createInterface, updateInterface } from '@/api/case';
    export default {
        name: 'createInterface',
        data() {

            return {
                validatePass:(rule, value, callback)=>{
                    let index = rule.field.split('.')[1];

                    let key = this.form.headers[index].key;
                    let val = this.form.headers[index].value;
                    let paramType = this.form.headers[index].type;
                    this.checkoutKeyValue(key,val,paramType,callback);
                },
                validateCondition:(rule, value, callback)=>{
                    let vindex = rule.field.split('.')[1];
                    let cindex = rule.field.split('.')[3];

                    let key = this.form5.validator[vindex].key;
                    let val = this.form5.validator[vindex].condition[cindex].value;
                    let paramType = this.form5.validator[vindex].condition[cindex].type;
                    this.checkoutKeyValue(key,val,paramType,callback);
                },
                validateOption:(rule, value, callback)=>{
                    let vindex = rule.field.split('.')[1];
                    let cindex = rule.field.split('.')[3];

                    let key = this.form5.validator[vindex].key;
                    let option = this.form5.validator[vindex].condition[cindex].option;

                    if(key!=""&&option==""){
                        callback(new Error("Option不能为空！"));
                    }else{
                        callback();
                    }
                },
                form: {
                    project_id: '',
                    version_id: [],
                    module: '',
                    id: '',
                    name: '',
                    method: 'GET',
                    url: '',
                    body: {},
                    headers: [{key:'',value:'',type:'string'}],
                    key: [],
                    validator: {},
                    expect: ''
                },
                form6: {
                },
                response:{
                    body: '',
                    headers: '',
                    validate_result: [],
                    savedKey: []
                },
                bodyContent: "",
                expectContent: "",
                key: {
                    keysType: '',
                    saveKey: ''
                },
                projectList: [],
                versionList: [],
                moduleList: [],
                urlPath: '',
                param: [{key:'',value:''}],
                form5:{
                    validator: [
                        {key: '', condition:[{option: '', value:'',type:'string'}]}
                    ]
                },
                formRule:{
                    project_id: [{required: true, message: '请选择项目', trigger: 'change'}],
                    version_id: [{required: true, message: '请选择版本', trigger: 'change'}],
                    module: [{required: true, message: '请选择模块', trigger: 'change'}],
                    name: [{required: true, message: '请填写接口名称', trigger: 'blur'}],
                },
                formLabelWidth: '90px',
                testVisible: false,
                paramsVisible: true,
                validatorVisible: false,
            }
        },
        mounted() {
            this.getParams();
        },
        methods: {
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                if(flag === true){
                    let self = this;
                    getVersionList({project_id: self.form.project_id}).then(function (response) {
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getModule(flag){
                if(flag === true) {
                    let self = this;
                    getModuleList({
                        project_id: self.form.project_id,
                        version_id: (self.form.version_id).join(',')
                    }).then(function (response) {
                        self.moduleList = response.data.module;
                    }).catch(function (err) {
                    });
                }
            },
            getParams() {
                // 取到路由带过来的参数
                this.getProject();
                if (this.$route.params.dataObj) {
                    this.form = this.$route.params.dataObj;
                    this.form.headers = this.form.origin_headers;
                    this.form.version_id = this.form.version_id.toString().split(',');
                    this.bodyContent = JSON.stringify(this.form.body, null, 4);
                    this.expectContent = JSON.stringify(this.form.expect, null, 4);
                    this.getVersion(true);
                    this.getModule(true);
                    this.checkURL();
                    this.convertObjToList();
                    this.unConvertValidator(this.form.validator);
                    this.getKeyTypeAndSavekey(this.form.key);
                }
            },
            getKeyTypeAndSavekey(data){
                let type = Object.prototype.toString.call(data);
                switch(type){
                    case '[object Array]':
                        this.key.keysType = 'KeyList';
                        this.key.saveKey = data.toString();
                        break;
                    case '[object Object]':
                        this.key.keysType = 'JsonPath';
                        this.key.saveKey = JSON.stringify(data);
                        break;
                    default:
                        break;
                }
            },
            convertObjToList(){
                let data = this.form.headers;
                let isNull = Object.keys(data).length===0?true:false;
                if(isNull){
                    this.form.headers = [{key: '', value: '', type: 'string'}];
                }else{
                    if(Array.isArray(data)){
                        this.actualTypeToString();
                    }else{
                        this.form.headers = this.objToArrary(data);
                    }
                }
            },
            unConvertValidator(data){
                this.form5.validator = [];
                for(var key in data){
                    let value = data[key];
                    let tmp = [];
                    for(var index in value){
                        tmp.push({option: index, value: value[index].toString(), type: typeof value[index]})
                    }
                    this.form5.validator.push({key: key, condition: tmp})
                }
                if(this.form5.validator.length === 0){
                    this.form5.validator.push({key: '', condition: [{option: '', value: '', type: 'string'}]});
                }
            },
            checkURL(){
                let tmp = this.form.url;
                let position = tmp.indexOf('?');
                if(position === -1){
                    this.urlPath = tmp;
                    this.param = [{key:'',value:''}];
                }
                else{
                    this.urlPath = tmp.substring(0, position);
                    this.param = [];
                    let list = tmp.substring(position+1).split("&");
                    for(var item of list){
                        let p = item.indexOf("=")
                        this.param.push({key: item.substring(0,p), value: item.substring(p+1)})
                    }
                }
            },
            paramsToPath(){
                let tmp =this.urlPath;
                this.param.forEach(function(item){
                    if(item.key !== ''){
                        if(tmp.indexOf('?') === -1){
                            tmp = tmp + "?" + item.key + "=" + item.value;
                        }
                        else{
                            tmp = tmp + "&" + item.key + "=" + item.value;
                        }
                    }
                })
                this.form.url = tmp;
            },
            checkBodyContent(){
                try{
                    let tmp = {};
                    if(this.bodyContent !== "") {
                        tmp = JSON.parse(this.bodyContent);
                    }
                    this.form.body = tmp;
                    return true;
                }
                catch(e){
                    this.$notify.error("不是合法的JSON格式，请修改！");
                    return false;
                }
            },
            checkSaveKey(){
                if(this.key.keysType == "KeyList") {
                    try {
                        let tmp = this.key.saveKey.split(",");
                        this.form.key = tmp.filter(function (item) {
                            return item !== '';
                        });
                        return true;
                    } catch (err) {
                        console.log(err);
                        this.$message.error("KeyList格式不符合要求，请修改！");
                        return false;
                    }
                }
                if(this.key.keysType == 'JsonPath') {
                    try {
                        this.form.key = JSON.parse(this.key.saveKey);
                        return true;
                    } catch (err) {
                        this.$notify.error("JsonPath格式不符合要求，请修改！");
                        return false;
                    }
                }else if(this.key.keysType == ''){
                    this.form.key = [];
                }
                return true;
            },
            checkExpect(){
                try{
                    if(this.expectContent === "") {
                        this.$notify.error("期望响应体必填！");
                        return false;
                    }
                    else{
                        this.form.expect = JSON.parse(this.expectContent);
                        return true;
                    }
                }
                catch(e){
                    this.$notify.error("不是合法的JSON格式，请修改！")
                    return false;
                }
            },
            convertValidator(){
                this.form.validator = {};
                let self = this;
                this.form5.validator.forEach(function(item,index){
                    if(item.key !== ''){
                        let tmp = {};
                        item.condition.forEach(function(i){
                            let value = i.value;
                            if(i.type === 'number'){
                                value = Number(i.value);
                            }
                            if(i.type === 'boolean'){
                                value = i.value.toLowerCase() === 'true';
                            }
                            tmp[i.option] = value;
                        })
                        self.$set(self.form.validator, item.key, tmp)
                    }
                })
            },
            convertData(){
                if(this.form.method === "GET"){
                    this.form.body = {}
                }
                this.convertValidator();
                this.stringToActualType();
            },
            validateFormRule(formName){
                let result = false;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        console.log("validate true")
                        result = true;
                    }
                    else {
                        console.log("validate false")
                    }
                })
                return result;
            },
            checkData(){
                return this.validateFormRule('form1') && this.validateFormRule('form2')
                    && this.validateFormRule('headers') && this.validateFormRule('form5')
                    && this.checkBodyContent() && this.checkSaveKey() && this.checkExpect()
            },
            send(){
                if(this.checkData()){
                    this.convertData();
                    let self = this;
                    sendInterface(self.form6).then(function (response) {
                        if(response.data.code === 0){
                            self.response.body = JSON.stringify(response.data.response,null,8);
                            self.response.headers = JSON.stringify(response.headers,null,8);
                            self.response.validate_result = response.data.validate_result;
                            self.response.savedKey = response.data.pipe_save;
                            self.testVisible = true;
                        }
                        else{
                            self.$message.error(response.data.msg)
                        }
                    }).catch(function (err) {
                    });
                }
            },
            commit(){
                if(this.checkData()){
                    this.convertData();
                    let self = this;
                    // id大于0为编辑，小于等于0为新增
                    if(self.form.id > 0){
                        updateInterface(self.form.id, self.form6).then(function (response) {
                            if (response.data.code === 0) {
                                self.$message.success("修改成功！");
                                self.goToList();
                            }
                            else {
                                self.$message.error(response.data.msg)
                            }
                        }).catch(function (err) {
                        });
                    }
                    else{
                        createInterface(self.form6).then(function (response) {
                            if(response.data.code === 0){
                                self.$message.success("新增成功！");
                                self.resetForm();
                            }
                            else{
                                self.$message.error(response.data.msg)
                            }
                        }).catch(function (err) {
                        });
                    }
                }
            },
            goToList(){
                this.$router.replace({
                    path: '/autoTest/interfaceList',
                })
            },
            addParam(){
                this.param.push({key:'',value:''});
            },
            removeParam(index){
                this.param.splice(index,1);
                this.paramsToPath();
            },
            addHeader(){
                this.form.headers.push({key:'',value:'', type: 'string'});
            },
            removeHeader(index){
                this.form.headers.splice(index,1);
            },
            addValidate(){
                this.form5.validator.push({key: '', condition:[{option: '', value:'', type: 'string'}]});
            },
            removeValidate(index){
                this.form5.validator.splice(index,1);
            },
            addCondition(index){
                this.form5.validator[index].condition.push({option: '', value:'', type: 'string'});
            },
            removeCondition(index,vindex){
                this.form5.validator[index].condition.splice(vindex,1);
            },
            checkerFormat(row, column){
                let checker = row[column.property];
                if (checker === undefined) {
                    return "";
                }
                return checker.toString();
            },
            JSONformat(value){
                let data = this[value];
                if(data !== "")
                {
                    var obj;
                    try {
                        //data有可能不是合法的JSON字符串，便会产生异常
                        obj = JSON.parse(data);
                        this[value] = JSON.stringify(obj, null, 4);
                    } catch (e) {
                        console.log(e)
                        this.$notify.error('不合法的JSON格式！');
                    }
                }
            },
            resetForm(){
                this.$refs["form1"].resetFields();
                this.$refs["form2"].resetFields();
                this.$refs["headers"].resetFields();
                this.$refs["form5"].resetFields();
                this.form = {
                    project_id: '',
                    version_id: [],
                    module: '',
                    id: '',
                    name: '',
                    method: 'GET',
                    url: '',
                    body: {},
                    headers: [{key:'',value:'',type:'string'}],
                    key: [],
                    validator: {},
                    expect: ''
                };
                this.response = {
                    body: '',
                    headers: '',
                    validate_result: [],
                    savedKey: []
                };
                this.bodyContent = "";
                this.expectContent = "";
                this.key = {
                    keysType: '',
                    saveKey: ''
                };
                this.param = [{key:'',value:''}];
                this.form5.validator = [
                    {key: '', condition:[{option: '', value:'',type:'string'}]}
                ];
            },
            checkoutKeyValue(key,val,paramType,callback){
                let expNumber = /^[0-9]*$/;

                let bool=['true','false'];
                if(key!=""&&val==""){
                    callback(new Error(key+"的校验值必填！"));
                }
                else if(paramType=="number"){
                    if(!expNumber.test(val)){
                        callback(new Error("请输入Number格式！"));
                    }else{
                        callback();
                    }
                }
                else if(paramType=="boolean"){
                    if(bool.indexOf(val.toLowerCase())===-1){
                        callback("请输入Boolean格式！") ;
                    }
                    else {
                        callback();
                    }
                }
                else{
                     callback();
                }
            },
           stringToActualType(){
                this.form6 = this.deepClone(this.form);
                this.form6.version_id = this.form6.version_id.join(',');
                let data = this.form6.headers;
                this.form6.headers=[];
                for(let item of data){
                    if(item.key !== ''){
                        let value = item.value;
                        if(item.type === 'number'){
                            value = Number(item.value);
                        }
                        if(item.type === 'boolean'){
                            value = item.value.toLowerCase() ==="true";
                        }
                        this.form6.headers.push({key:item.key, value:value,type:item.type});
                    }
                }
            }, 
            objToArrary(data){
                let list = [];
                for(let key in data){
                    list.push({key: key, value: data[key]+'', type: typeof(data[key]+'')});
                }
                return list;
            },
            actualTypeToString(){
                let list = [];
                let data = this.form.headers;
                for(let item of data){
                    if(item.key !== ''){
                        list.push({key:item.key, value:item.value+'',type:item.type});
                    }
                }
                this.form.headers = list;
            },
            deepClone(data){
                return JSON.parse(JSON.stringify(data));
            }
        },
        beforeDestroy() {
            this.$store.dispatch('app/toggleParentNav')
        }
    }
</script>

<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }

    .code_tip{
        padding: 0;
        margin-bottom: 0;
    }

    .para-form-item{
        margin-bottom: 18px;
    }
</style>
