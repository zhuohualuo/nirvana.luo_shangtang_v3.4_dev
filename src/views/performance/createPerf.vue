<template>
    <div id="content" style="width: 97%">
        <el-row>
            <el-form :model="formValidate" ref="formValidate">
                <el-col :span="4">
                    <el-form-item label="项目" label-width="70px" prop="project_id"
                                  :rules="{ required: true, message: '项目不能为空', trigger: 'change' }">
                        <el-select v-model="formValidate.project_id"
                                    :disabled="isDisabled"
                                   @change="(val)=>{handleReset();formValidate.project_id=val}">
                            <el-option
                                    v-for="(item,index) in projectList"
                                    :label="item.name"
                                    :value="item.id"
                                    :key="index">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="任务名称" :label-width="formLabelWidth" prop="title"
                                  :rules="{validator: checkTitle, required: true, trigger: 'blur'}">
                        <el-input v-model.trim="formValidate.title" placeholder="请输入任务名称，不可以数字开头，不可包含中文" auto-complete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-form-item label="Host" :label-width="formLabelWidth" prop="host"
                                    :rules="{required: true, message: 'Host不能为空', trigger: 'change'}">
                        <el-input v-model.trim="formValidate.host" placeholder="请输入HOST" auto-complete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-form-item label="测试类型" :label-width="formLabelWidth" prop="type"
                                  :rules="{ required: true, message: '测试类型不能为空', trigger: 'change' }">
                        <el-select v-model="formValidate.type" placeholder="请选择" :disabled="isEdit">
                            <el-option label="单接口场景" value="single" key="single"></el-option>
                            <el-option label="多接口串行场景" value="flow" key="flow"></el-option>
                            <el-option label="多接口混合场景" value="mixed" key="mixed"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-form-item label="测试工具" :label-width="formLabelWidth" prop="tool"
                                  @change='strategy={name:"",value:{}}'>
                        <el-select v-model="formValidate.tool" placeholder="请选择">
                            <el-option label="Gatling" value="gatling" key="gatling"></el-option>
                            <el-option label="JMeter" value="jmeter" key="jmeter"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-form>
        </el-row>
        <el-row v-if="!isMixed">
            <el-form>
                <el-col :span="8">
                    <el-form-item label="执行策略" label-width="70px">
                        <el-select
                                v-model="strategy.name"
                                style="width: 100%"
                                @visible-change="getStrategy"
                                @change="choosedStrategy">
                            <el-option
                                    v-for="(item,index) in strategyList"
                                    :label="item.description"
                                    :value="item.strategy"
                                    :key="index">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="4" v-for="(item,index) in strategy.value" :key="index">
                    <el-form-item style="margin-left: 5px">
                        <el-input class="strategy-input" v-model="strategy.value[index]" placeholder="请输入" auto-complete="off">
                            <span slot="prepend">{{index}}</span>
                        </el-input>
                    </el-form-item>
                </el-col>
            </el-form>
        </el-row>
        <el-row>
            <el-form :model="formValidate">
                <el-col :span="12">
                    <el-form-item label="执行标准" label-width="70px">
                        <el-input v-model="formValidate.task.criterion.rspt" placeholder="请输入RSPT" auto-complete="off" style="width: 49%">
                            <span slot="prepend">RSPT</span>
                        </el-input>
                        <el-input v-model="formValidate.task.criterion.qps" placeholder="请输入QPS" auto-complete="off" style="width: 49%">
                            <span slot="prepend">QPS</span>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="融合配置参数" label-width="100px">
                        <el-input v-model="formValidate.task.keys" placeholder="用于测试集自动生成配置，以英文逗号间隔" auto-complete="off" style="width: 100%"></el-input>
                    </el-form-item>
                </el-col>
            </el-form>
        </el-row>
        <el-row>
            <div class="setupTable">
                <span class="stepSpan" style="padding-left: 30px;">前置</span>
                <el-table :data="formValidate.setup"
                          border class='_table' header-cell-class-name="_table-head"
                          style="overflow: auto;max-height:300px;margin-left:12px;margin-top: 0">
                    <el-table-column label="URL">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.req_url" placeholder="请输入"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="method" width="180">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.req_method">
                                <el-option value="get" label="GET"></el-option>
                                <el-option value="post" label="POST"></el-option>
                                <el-option value="put" label="PUT"></el-option>
                                <el-option value="delete" label="DELETE"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="参数" width="180">
                        <template slot-scope="scope">
                            <el-button @click='clickContent(scope.row,"参数")' type="text" style="text-decoration: underline">编 辑</el-button>
                            <!--<div style="max-height: 250px; overflow: auto">-->
                                <!--<pre title="双击进入编辑">{{paramsFormat(scope.row)}}</pre>-->
                            <!--</div>-->
                        </template>
                    </el-table-column>
                    <el-table-column label="请求头" width="180">
                        <template slot-scope="scope">
                            <el-button @click='clickContent(scope.row,"请求头")' type="text" style="text-decoration: underline">编 辑</el-button>
                            <!--<div style="max-height: 250px; overflow: auto">-->
                                <!--<pre title="双击进入编辑">{{headersFormat(scope.row)}}</pre>-->
                            <!--</div>-->
                        </template>
                    </el-table-column>
                    <el-table-column label="files(性能素材的全路径)" width="300">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.files" placeholder="请输入"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column width="150" align="center">
                        <template slot="header" slot-scope="props">
                            <el-button type="primary" size='small' @click="addSetupStep" icon="el-icon-plus">新 增</el-button>
                        </template>
                        <template slot-scope='props'>
                            <el-button @click='removeSetupStep(props.$index)' type="text" style="color: #F56C6C;text-decoration: underline">删 除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="setupTable">
                <span class="stepSpan">待测接口</span>
                <el-table :data="contentList" :key="Math.random()"
                          height="435" border class='_table' header-cell-class-name="_table-head"
                          style="overflow: auto;margin-left:12px;"
                          @cell-dblclick="clickContent">
                    <el-table-column label="请求名称">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.task_name" placeholder="请输入"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="请求方法" width="150">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.method">
                                <el-option value="get" label="GET"></el-option>
                                <el-option value="post" label="POST"></el-option>
                                <el-option value="put" label="PUT"></el-option>
                                <el-option value="delete" label="DELETE"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="接口地址">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.rest_path" placeholder="请输入"></el-input>
                        </template>
                    </el-table-column>
                    <div v-if="isMixed">
                        <el-table-column label="执行策略" width="150">
                            <template slot-scope="scope">
                                <el-button @click='clickContent(scope.row,"执行策略")' type="text" style="text-decoration: underline">编 辑</el-button>
                                <!--<div style="max-height: 250px; overflow: auto">-->
                                <!--<pre title="双击进入编辑">{{strategyFormat(scope.row)}}</pre>-->
                                <!--</div>-->
                            </template>
                        </el-table-column>
                    </div>
                    <el-table-column label="请求头" width="150">
                        <template slot-scope="scope">
                            <el-button @click='clickContent(scope.row,"请求头")' type="text" style="text-decoration: underline">编 辑</el-button>
                            <!--<div style="max-height: 250px; overflow: auto">-->
                                <!--<pre title="双击进入编辑">{{headersFormat(scope.row)}}</pre>-->
                            <!--</div>-->
                        </template>
                    </el-table-column>
                    <el-table-column label="请求体" width="150">
                        <template slot-scope="scope">
                            <el-button @click='clickContent(scope.row,"请求体")' type="text" style="text-decoration: underline"
                                       :disabled='scope.row.method==="get"'>编 辑</el-button>
                            <!--<div style="max-height: 250px; overflow: auto">-->
                                <!--<pre title="双击进入编辑">{{bodyFormat(scope.row)}}</pre>-->
                            <!--</div>-->
                        </template>
                    </el-table-column>
                    <el-table-column label="自定义校验" width="150">
                        <template slot-scope="scope">
                            <el-button @click='clickContent(scope.row,"自定义校验")' type="text" style="text-decoration: underline">编 辑</el-button>
                            <!--<div style="max-height: 250px; overflow: auto">-->
                                <!--<pre title="双击进入编辑">{{zdyFormat(scope.row)}}</pre>-->
                            <!--</div>-->
                        </template>
                    </el-table-column>
                    <div v-if="isFlow">
                        <el-table-column label="保存Key" width="150">
                            <template slot-scope="scope">
                                <el-button @click='clickContent(scope.row,"保存Key")' type="text" style="text-decoration: underline">编 辑</el-button>
                                <!--<div style="max-height: 250px; overflow: auto">-->
                                <!--<pre title="双击进入编辑">{{saveValueFormat(scope.row)}}</pre>-->
                                <!--</div>-->
                            </template>
                        </el-table-column>
                    </div>
                    <el-table-column width="150" align="center">
                        <template slot="header" slot-scope="props">
                            <el-button type="primary" size='small' @click="addStep" icon="el-icon-plus">新 增</el-button>
                        </template>
                        <template slot-scope='props'>
                            <el-button @click='copyStep(props.$index)' type="text" style="text-decoration: underline">克 隆</el-button>
                            <el-button @click='removeStep(props.$index)' type="text" style="color: #F56C6C;text-decoration: underline">删 除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-row>

        <div class="page-footer-right">
            <el-button type="ghost" @click="handleReset()" :disabled="isEdit">重置</el-button>
            <el-button type="primary" @click="handleSubmit('formValidate')" style="margin-left: 8px">提交</el-button>
        </div>

        <el-dialog title="编辑请求头" :visible.sync="headersVisible">
            <json-editor v-model="tmpHeaders" key="header"></json-editor>
            <div slot="footer" class="dialog-footer">
                <el-button @click="headersVisible = false">取 消</el-button>
                <el-button type="primary" @click="editHeaders">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="编辑请求头" :visible.sync="headersSetupVisible">
            <json-editor v-model="tmpSetupHeaders" key="header"></json-editor>
            <div slot="footer" class="dialog-footer">
                <el-button @click="headersSetupVisible = false">取 消</el-button>
                <el-button type="primary" @click="editSetupHeaders">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="编辑参数" :visible.sync="paramsSetupVisible">
            <json-editor v-model="tmpSetupParams" key="header"></json-editor>
            <div slot="footer" class="dialog-footer">
                <el-button @click="paramsSetupVisible = false">取 消</el-button>
                <el-button type="primary" @click="editSetupParams">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="编辑请求体" :visible.sync="bodyVisible">
            <json-editor v-model="tmpBody" key="body"></json-editor>
            <div slot="footer" class="dialog-footer">
                <el-button @click="bodyVisible = false">取 消</el-button>
                <el-button type="primary" @click="editBody">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="自定义校验" :visible.sync="zdyVisible">
            <json-editor v-model="zdyBody" key="checker"></json-editor>
            <div slot="footer" class="dialog-footer">
                <el-button @click="zdyVisible = false">取 消</el-button>
                <el-button type="primary" @click="editChecker">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="编辑保存项" :visible.sync="saveValueVisible">
            <config-table :tableColumn="tableColumn" :tableData="saveValueForm"></config-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="saveValueVisible = false">取 消</el-button>
                <el-button type="primary" @click="editSaveValue">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="编辑执行策略" :visible.sync="strategyVisible" width="40%">
            <el-form>
                <el-form-item label="执行策略" :label-width="formLabelWidth">
                    <el-select v-model="strategy.name"
                               @visible-change="getStrategy"
                               @change="choosedStrategy">
                        <el-option
                                v-for="(item,index) in strategyList"
                                :label="item.strategy"
                                :value="item.strategy"
                                :key="index"
                                :title="item.description">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-for="(item,index) in strategy.value" :label="index" :label-width="formLabelWidth" :key="index">
                    <el-input class="strategy-input" v-model="strategy.value[index]" style="width: 400px" placeholder="请输入" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="strategyVisible = false">取 消</el-button>
                <el-button type="primary" @click="editStrategy">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import { getProjectList } from '@/api/project';
    import { addPerfTask, updatePerfTask, getPerfStrategyList } from '@/api/performance';
    import JsonEditor from '@/components/JsonEditor';
    import ConfigTable from "../../components/ConfigTable/index";

    export default {
        name: "createPerf",
        components: {ConfigTable, JsonEditor },
        data () {
            return {
                checkTitle: (rule,value,callback)=>{
                    if(!value){
                        callback(new Error('任务名称不能为空'))
                    }
                    if(/^\d/.test(value)){
                        callback(new Error('任务名称不可以数字开头'))
                    }
                    if(/[\u4e00-\u9fa5]/.test(value)){
                        callback(new Error('任务名称不可包含中文'))
                    }
                    else{
                        callback()
                    }
                },
                isDisabled:false,
                projectList: [],
                strategyList: [],
                filter: {
                    id: '',
                    title: '',
                    project_id: '',
                    status: '',
                    tool: '',
                    type: '',
                    executor: '',
                },
                formValidate: {
                    id: 0,
                    project_id: '',
                    title: '',
                    host: '',
                    tool: 'gatling',
                    type: 'single',
                    task: {
                        keys:'',
                        criterion: {
                            rspt: '',
                            qps: ''
                        }
                    },
                    setup: [{req_method: "get", req_url: "", params: "", headers: "", files: ""}]
                },
                tmpHeaders: '',
                tmpSetupHeaders:'',
                tmpSetupParams:'',
                tmpBody: '',
                zdyBody:'',
                strategy: {name: "", value: {}},
                saveValueForm: [{name: '', value: ''}],
                currentRow: {},
                contentList: [{method: "get", task_name: "", rest_path: "", headers: "", body: "", save_value: "",checker:"", strategy: {name: "", value: {}}}],
                formLabelWidth: '90px',
                headersVisible: false,
                bodyVisible: false,
                zdyVisible:false,
                strategyVisible: false,
                saveValueVisible: false,
                isEdit: false,
                headersSetupVisible:false,
                paramsSetupVisible:false,
                tableColumn:[
                    {label:"保存名称",key:"name",type:"input"},
                    {label:"保存项JsonPath",key:"value",type:"input"},
                ]
            }
        },//data
        computed: {
            isMixed() {
                return this.formValidate.type == 'mixed';
            },
            isFlow() {
                return this.formValidate.type == 'flow';
            }
        },//computed
        mounted() {
            this.getParams()
        },
        methods: {
            getParams () {
                // 取到路由带过来的参数
                if(this.$route.params.dataObj){
                    this.isDisabled = true;
                    let tmp = Object.assign(this.formValidate,this.$route.params.dataObj);
                    console.log('tmp',tmp)
                    if(tmp.setup){
                        this.formValidate.setup = tmp.setup;
                    }else{
                        this.formValidate.setup = [];
                    }
                    if(!tmp.task.criterion){
                      this.formValidate.task["criterion"] = {rspt: '',qps: ''};
                    }
                    this.formValidate = tmp;
                    this.getStrategy(true);
                    this.convertContent();
                }
                if(this.$route.params.filter){
                    this.filter = this.$route.params.filter;
                }
                this.getProject();
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects
                }).catch(function (err) {
                });
            },
            getStrategy(flag){
                if(flag === true) {
                    let self = this;
                    getPerfStrategyList({
                        tool: self.formValidate.tool
                    }).then(function (response) {
                        self.strategyList = response.data.strategies;
                    }).catch(function (err) {
                    });
                }
            },
            choosedStrategy(val){
                this.strategy.value = {};
                let tmp = this.strategyList.filter((item)=>{
                    return item.strategy === val;
                })
                this.strategy.description = tmp[0].description;
                let params = tmp[0].params;
                for(let item of params){
                    this.$set(this.strategy.value, item, "")
                }
            },
            clickContent(row, column){
                this.currentRow = row;
                if(column === '请求头'){
                    if(row.method){
                        this.tmpHeaders = this.headersFormat(row);
                        this.headersVisible = true;
                    }
                    if(row.req_method){
                        this.tmpSetupHeaders = this.headersFormat(row);
                        this.headersSetupVisible = true;
                    }
                }
                if(column === '请求体'){
                    if(row.method && row.method !== "get"){
                        this.tmpBody = this.bodyFormat(row);
                        this.bodyVisible = true;
                    }
                }
                if(column === '自定义校验'){
                    this.zdyBody = this.zdyFormat(row);
                    this.zdyVisible = true;
                }
                if(column === '参数'){
                    this.tmpSetupParams = this.paramsFormat(row);
                    this.paramsSetupVisible = true;
                }
                if(column === '执行策略'){
                    this.strategy = row.strategy;
                    this.strategyVisible = true;
                }
                if(column === '保存Key'){
                    this.save_value = row.save_value;
                    this.saveValueVisible = true;
                }
            },
            headersFormat(row){
                if(row.headers && (typeof row.headers == 'object')){
                    return JSON.stringify(row.headers, null, 4);
                }
                return '';
            },
            paramsFormat(row){
                if(row.params && (typeof row.params == 'object')){
                    return JSON.stringify(row.params, null, 4);
                }
                return '';
            },
            bodyFormat(row){
                if(row.body && (typeof row.body == 'object')){
                    return JSON.stringify(row.body, null, 4);
                }
                return '';
            },
            zdyFormat(row){
                if(row.checker && (typeof row.checker == 'object')){
                    return JSON.stringify(row.checker, null, 4);
                }
                return '';
            },
            saveValueFormat(row){
                if(row.save_value && (typeof row.save_value == 'object')){
                    return JSON.stringify(row.save_value, null, 4);
                }
                return '';
            },
            strategyFormat(row){
                let str = row.strategy.name;
                for(var key in row.strategy.value){
                    let val = row.strategy.value[key];
                    str = str.replace(key, val);
                }
                return str;
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
            combineContent(){
                let obj = {};
                if(this.contentList.length === 0){
                    this.$message.error("至少包含一个请求!");
                    return false;
                }
                if(this.isMixed){
                    obj["objects"] = [];
                    for(let item of this.contentList){
                        obj.objects.push({
                            headers: item.headers,
                            body: item.body,
                            method: item.method,
                            strategy: this.strategyFormat(item),
                            rest_path: item.rest_path,
                            task_name: item.task_name,
                            checker:item.checker
                        })
                    }
                }
                else{
                    obj["strategy"] = this.strategyFormat(this);
                    obj["objects"] = [];
                    for(let item of this.contentList){
                        obj.objects.push({
                            headers: item.headers,
                            body: item.body,
                            method: item.method,
                            rest_path: item.rest_path,
                            task_name: item.task_name,
                            save_value: item.save_value,
                            checker:item.checker
                        })
                    }
                }
                this.formValidate.task = Object.assign(this.formValidate.task, obj);
                return true;
            },
            splitStrategy(strategy){
                let result = {name: "", value: {}};
                let reg = /(?<=\()[^()]*(?=\))/g;   //匹配小括号中内容
                let str = strategy.replace(reg, '');
                let tmp = this.strategyList.filter((item)=>{
                    return item.strategy.replace(reg, '') === str;
                })
                if(tmp && tmp.length>0){
                    let pList = tmp[0].strategy.match(reg);
                    let vList = strategy.match(reg);
                    let vObj = {};
                    for(var key in pList){
                        vObj[pList[key]] = vList[key];
                    }
                    result = {name: tmp[0].strategy, value: vObj};
                }
                return result;
            },
            convertContent(){
                this.isEdit = true;
                this.contentList = [];
                let self = this;
                let objects = self.formValidate.task.objects;
                let isMixed = self.formValidate.type == "mixed";
                getPerfStrategyList({
                    tool: self.formValidate.tool
                }).then(function (response) {
                    self.strategyList = response.data.strategies;

                    self.strategy = isMixed ? {name: "", value: {}} : self.splitStrategy(self.formValidate.task.strategy);
                    for(let item of objects){
                        self.contentList.push({
                            method: item.method,
                            task_name: item.task_name,
                            rest_path: item.rest_path,
                            headers: item.headers,
                            body: item.body,
                            checker:item.checker,
                            save_value: item.save_value,
                            strategy: isMixed ? self.splitStrategy(item.strategy) : {name: "", value: {}},
                        })
                    }
                }).catch(function (err) {
                });
            },
            handleSubmit(name) {
                if (this.validateFormRule(name) && this.combineContent()) {
                    //有id表示是做修改，没有表示是新增
                    let ref = this;
                    if (ref.formValidate.id > 0 ){
                        updatePerfTask(ref.formValidate.id, ref.formValidate).then(function (response) {
                            if(response.data.code === 0){
                                ref.$message.success('提交成功!');
                                ref.gotoPerfList();
                                ref.handleReset();
                            }else{
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                        });
                    }
                    else{
                        addPerfTask(ref.formValidate).then(function (response) {
                            if(response.data.code === 0){
                                ref.$message.success('提交成功！请在性能测试任务列表中查看');
                                ref.handleReset();
                            }else{
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                        });
                    }
                }
                else{
                    return false;
                }
            },
            handleReset () {
                this.$refs["formValidate"].resetFields();
                this.formValidate = {
                    id: 0,
                    project_id: '',
                    title: '',
                    host: '',
                    tool: 'gatling',
                    type: 'single',
                    task: {
                        keys:'',
                        criterion: {
                            rspt: '',
                            qps: ''
                        }
                    },
                    setup: [{req_method: "get", req_url: "", params: "", headers: "", files: ""}]
                }
                this.contentList = [{method: "get", task_name: "", rest_path: "", headers: "", body: "", save_value: "",checker:"", strategy: {name: "", value: {}}}];
                this.currentRow = {};
                this.tmpHeaders = '';
                this.tmpSetupHeaders = '',
                this.tmpSetupParams = '',
                this.tmpBody = '';
                this.zdyBody = '';
                this.saveValueForm = [{name: '', value: ''}];
                this.strategy = {name: "", value: {}};
            },
            gotoPerfList() {
                this.$router.push({
                    path: 'perf/perfTaskList',
                    name: 'perfTaskList',
                    params: {
                        filter: this.filter
                    }
                })
            },
            addSetupStep(){
                this.formValidate.setup.push({req_method: "get", req_url: "", params: "", headers: "", files: ""});
            },
            removeSetupStep(index){
                this.formValidate.setup.splice(index,1)
            },
            addStep(){
                this.contentList.push({method: "get", task_name: "", rest_path: "", headers: "", body: "", strategy: {name: "", value: {}}});
            },
            removeStep(index){
                this.contentList.splice(index,1)
            },
            copyStep(index){
                let tmp = Object.assign({},this.contentList[index]);
                this.contentList.push(tmp);
            },
            editHeaders(){
                let obj = {};
                if(this.tmpHeaders){
                    try{
                        obj = JSON.parse(this.tmpHeaders);
                    }
                    catch(err){
                        this.$notify.error("请求头不是合法的JSON格式！");
                        return
                    }
                }
                this.currentRow.headers = obj;
                this.headersVisible = false;
            },
            editSetupHeaders(){
                let obj = {};
                if(this.tmpSetupHeaders){
                    try{
                        obj = JSON.parse(this.tmpSetupHeaders);
                    }
                    catch(err){
                        this.$notify.error("请求头不是合法的JSON格式！");
                        return
                    }
                }
                this.currentRow.headers = obj;
                this.headersSetupVisible = false;
            },
            editSetupParams(){
                let obj = {};
                if(this.tmpSetupParams){
                    try{
                        obj = JSON.parse(this.tmpSetupParams);
                    }
                    catch(err){
                        this.$notify.error("请求头不是合法的JSON格式！");
                        return
                    }
                }
                this.currentRow.params = obj;
                this.paramsSetupVisible = false;
            },
            editBody(){
                let obj = {};
                if(this.tmpBody){
                    try{
                        obj = JSON.parse(this.tmpBody);
                    }
                    catch(err){
                        this.$notify.error("请求体不是合法的JSON格式！");
                        return
                    }
                }
                this.currentRow.body = obj;
                this.bodyVisible = false;
            },
            editChecker(){
                let obj = {};
                if(this.zdyBody){
                    try{
                        obj = JSON.parse(this.zdyBody);
                    }
                    catch(err){
                        this.$notify.error("请求体不是合法的JSON格式！");
                        return
                    }
                }
                this.currentRow.checker = obj;
                this.zdyVisible = false;
            },
            editSaveValue(){
                let obj = {};
                for(let item of this.saveValueForm){
                    if(item.value){
                        obj[item.name] = item.value;
                    }
                }
                this.currentRow.save_value = obj;
                this.saveValueVisible = false;
            },
            editStrategy(){
                this.currentRow.strategy = this.strategy;
                this.strategyVisible = false;
            },
            addSaveParam(){
                this.saveValueForm.splice(0,0,{name: '', value: ''})
            },
            removeSaveParam(index){
                this.saveValueForm.splice(index,1)
            },
        },
        beforeDestroy() {
            this.$store.dispatch('app/toggleParentNav')
        }
    }
</script>

<style scoped>
    .stepSpan{
        width: 58px;
        color: #606266;
        font-size: 14px;
    }
    .setupTable{
        display: flex;
        align-items: center;
    }
    ._tip{
        padding: 0 16px;
    }
    ._save-value .el-form-item{
        margin-bottom: 5px
    }
</style>
