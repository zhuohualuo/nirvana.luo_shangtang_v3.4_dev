<template>
    <div id="content">
        <el-row>
            <el-form :model="form" :rules="formRule" ref="form" style="height:30px">
                <el-col :span="10">
                    <el-form-item label="任务名称" :label-width="formLabelWidth" prop="title">
                        <el-input v-model.trim="form.title" auto-complete="off" size="small"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="4" :offset="2">
                    <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                        <el-select v-model="form.project_id" size="small" style="width: 100%"
                                   @change="form.version_id=''">
                            <el-option
                                    v-for="(item,index) in projectList"
                                    :label="item.name"
                                    :value="item.id"
                                    :key="index">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="4" :offset="1">
                    <el-form-item label="版本" :label-width="formLabelWidth" prop="version_id">
                        <el-select v-model="form.version_id" size="small" style="width: 100%"
                                   :disabled="form.project_id===''"
                                   @visible-change="getVersion"
                                   @change="getSet"
                        >
                            <el-option
                                    v-for="(item,index) in versionList"
                                    :label="item.version"
                                    :value="item.id"
                                    :key="index">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-form>
        </el-row>
        <el-row>
            <el-col :span="10">
                <el-card shadow="never">
                    <el-form :inline="true" class="_bottom0 demo-form-inline _right" size="mini" style="margin-bottom:10px">
                        <el-form-item>
                            <el-select v-model="source.module"
                                       clearable style="width: 120px"
                                       placeholder="模块"
                                       filterable
                                       :disabled="form.version_id===''"
                                       @visible-change="getModule">
                                <el-option
                                        v-for="(item,index) in moduleList"
                                        :label="item"
                                        :value="item"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="source.type"
                                       clearable style="width: 120px"
                                       filterable
                                       placeholder="类型">
                                <el-option
                                        v-for="(item,index) in caseTypeList"
                                        :label="item.type_name"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-input v-model="source.name" placeholder="关键字" clearable style="width: 120px"></el-input>
                        </el-form-item>
                    </el-form>
                    <el-table :data="sourceShowList"
                              height="590" border class='_table sourceShowList' header-cell-class-name="_table-head"
                              highlight-current-row size="mini"
                              @select-all="sourceSelectAll"
                              @selection-change="sourceSelectionChange"
                              v-loadmore="sourceLoadMore"
                              @row-click="handleRowClick">
                        <el-table-column type="selection"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="title" label="测试集标题（未选择）"></el-table-column>
                        <el-table-column show-overflow-tooltip :render-header="renderSourceHeader">
                            <template slot-scope="scope">
                                <el-select v-model="selectSetup[scope.row.id]" placeholder="请选择" clearable multiple @change="choosedSetup(scope.row)">
                                    <el-option-group
                                            v-for="group in setupList"
                                            :key="group.label"
                                            :label="group.label">
                                        <el-option
                                                v-for="(item,index) in group.options"
                                                :key="index"
                                                :label="item.description"
                                                :value="item.name">
                                        </el-option>
                                    </el-option-group>
                                </el-select>
                                <span>{{setupInForm(scope.row.id)}}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
            <el-col :span="2">
                <div style="margin-left: 35%; margin-top: 300px">
                    <el-button type="primary" icon="el-icon-arrow-left" circle @click="targetToSource" :class="targetSelection.length=='0'?'leftOrRight':''"></el-button>
                </div>
                <br/>
                <div style="margin-left: 35%">
                    <el-button type="primary" icon="el-icon-arrow-right" circle @click="sourceToTarget" :class="sourceSelection.length=='0'?'leftOrRight':''"></el-button>
                </div>
            </el-col>
            <el-col :span="11">
                <el-card shadow="never">
                    <el-form :inline="true" class="_bottom0 demo-form-inline _right" size="mini" style="margin-bottom:10px">
                        <el-form-item>
                            <el-select v-model="target.module"
                                       clearable style="width: 120px"
                                       placeholder="模块"
                                       filterable
                                       :disabled="form.version_id===''"
                                       @visible-change="getModule">
                                <el-option
                                        v-for="(item,index) in moduleList"
                                        :label="item"
                                        :value="item"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="target.type"
                                       clearable style="width: 120px"
                                       filterable
                                       placeholder="类型">
                                <el-option
                                        v-for="(item,index) in caseTypeList"
                                        :label="item.type_name"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item >
                            <el-input v-model="target.name" placeholder="关键字" clearable style="width: 120px"></el-input>
                        </el-form-item>
                    </el-form>
                    <el-table :data="targetShowList"
                              height="590" border class='_table targetShowList' header-cell-class-name="_table-head"
                              highlight-current-row size="mini"
                              @select-all="targetSelectAll"
                              @selection-change="targetSelectionChange"
                              v-loadmore="targetLoadMore"
                              @row-click="handleRowClick">
                        <el-table-column type="selection"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="title" label="测试集标题（已选择）" width="200"></el-table-column>
                        <el-table-column show-overflow-tooltip label="Setup & Teardown">
                            <template slot-scope="scope">
                                <el-select v-model="selectSetup[scope.row.id]" placeholder="请选择" clearable multiple @change="choosedSetup(scope.row)">
                                    <el-option-group
                                            v-for="group in setupList"
                                            :key="group.label"
                                            :label="group.label">
                                        <el-option
                                                v-for="(item,index) in group.options"
                                                :key="index"
                                                :label="item.description"
                                                :value="item.name">
                                        </el-option>
                                    </el-option-group>
                                </el-select>
                                <span>{{setupInForm(scope.row.id)}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column show-overflow-tooltip width="110" :render-header="renderTargetHeader">
                            <template slot-scope="scope">
                                <el-button type="text" @click="editConfig(scope.row)" style="text-decoration: underline">编辑配置</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>

        <div class="page-footer-right">
            <el-button type="ghost" @click="resetForm" :disabled="collection_id!=''">重 置</el-button>
            <el-button type="primary" @click="saveTestPlanManage">提 交</el-button>
        </div>

        <el-dialog title='编辑配置' :visible.sync="dialogEdit">
            <config-table :tableColumn="tableColumn" :tableData="configForm" :height="450"></config-table>

            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogEdit = false">取 消</el-button>
                <el-button type="primary" @click="saveConfigManage">确 认</el-button>
            </div>
        </el-dialog>
    </div>
</template>


<script>
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { getCaseTypeList} from '@/api/case';
    import { getTestsetList, getSetup } from '@/api/testset';
    import { createTestPlan, updateTestPlan ,getTestPlanConfig} from '@/api/testPlan';
    import { getPlanProgress } from '@/api/testPlan';
    import {getKeyList} from '@/api/config'
    import ConfigTable from "../../components/ConfigTable/index";
    const plan = {};

    export default {
        name: 'editTestPlan',
        components: {ConfigTable},
        data() {
            return {
                tableColumn:[
                    {label:"参数",key:"name",type:"select",require:true,optionList:[],visible:this.getConfigKey},
                    {label:"值",key:"value",type:"input",require:true},
                ],
                collection_id:'',
                currentSetId:'',
                userConfig:{},
                paramsForm: [],
                configForm: [],
                dialogEdit:false,
                form: {
                    id: 0,
                    title: '',
                    project_id: '',
                    version_id: '',
                    set_ids: [],
                    setup_teardown: {},
                    user_config:{}
                },
                source:{name: '',module: '',type: '',setList: [],num: 20},
                target:{name: '',module: '',type: '',setList: [],num: 20},
                projectList: [],
                versionList: [],
                moduleList: [],
                caseTypeList: [],
                setupList: [],
                formRule:{
                    title: [
                        { required: true, message: '请填写测试任务名称', trigger: 'blur' }
                    ],
                    project_id: [
                        { required: true, message: '请选择项目', trigger: 'change' }
                    ],
                    version_id: [
                        { required: true, message: '请选择版本', trigger: 'change' }
                    ]
                },
                formLabelWidth: '80px',
                sourceSelection: [],
                targetSelection: [],
                sourceTmp: [],
                targetTmp: [],
                selectSetup:{},
                setupForm: {},
            }
        },
        computed:{
            sourceShowList: function(){
                let name = this.source.name.toLowerCase();
                let module = this.source.module;
                let type = this.source.type;
                let num = this.source.num;
                this.sourceSelection = [];
                this.sourceTmp = this.source.setList.filter(function(item){
                    return(
                        (name==="" || item.title.toLowerCase().indexOf(name)>-1)
                        && (module==="" || item.module===module)
                        && (type==="" || item.type===type)
                    )
                })
                return this.sourceTmp.slice(0,num)
            },
            targetShowList: function(){
                let name = this.target.name.toLowerCase();
                let module = this.target.module;
                let type = this.target.type;
                let num = this.target.num;
                this.targetSelection = [];
                this.targetTmp = this.target.setList.filter(function(item){
                    return(
                        (name==="" || item.title.toLowerCase().indexOf(name)>-1)
                        && (module==="" || item.module===module)
                        && (type==="" || item.type===type)
                    )
                })
                return this.targetTmp.slice(0,num)
            }
        },

        directives:{
            loadmore: {
                // 指令的定义
                bind: function (el,binding) {
                    // 获取element-ui定义好的scroll盒子
                    const TABLEWRAP_DOM = el.querySelector('.el-table__body-wrapper');
                    TABLEWRAP_DOM.addEventListener('scroll', function() {
                        /*
                         * scrollHeight 获取元素内容高度(只读)
                         * scrollTop 获取或者设置元素的偏移值,常用于计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
                         * clientHeight 读取元素的可见高度(只读)
                         * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
                         * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
                         */
                        if(this.scrollHeight - this.scrollTop === this.clientHeight){
                            binding.value(this.scrollTop);
                        }
                    })
                }
            }
        },
        mounted() {
            this.plan=JSON.parse(window.sessionStorage.getItem("updateSelf"));
            this.getProject();
            this.getCaseType();
            this.getParams();
        },
        methods: {
            getParams () {
                var self;
                if(this.$route.params.dataObj){
                    self=this.$route.params.dataObj
                }
                else if(JSON.stringify(this.plan)!='{}'){
                    self=this.plan
                }
                else{
                    return
                }
                this.resetForm();
                this.form = {
                    id: self.id,
                    title: self.title,
                    project_id: self.project_id,
                    version_id: self.version_id,
                    set_ids: self.set_ids,
                    setup_teardown: self.setup_teardown
                }
                //处理数据 self.userConfig
                let obj = {};
                for(var key in self.user_config){
                    if(!obj[key]) obj[key] = [];
                    for(var i in self.user_config[key]){
                        obj[key].push({name: i, value: ''+self.user_config[key][i], description:''})
                    }
                }
                this.userConfig = obj;
                this.collection_id = self.collection_id;
                this.convertSetupForm(self.setup_teardown);
                this.getVersion(true);
                this.getTaskSet(self);
            },
            getConfigParams(){
                let self = this;
                if(self.form.project_id!==''){
                    getKeyList({project_id: self.form.project_id}).then(function (response){
                        let list = [];
                        for(let key of response.data.keys){
                            list.push({label: key.name, value: key.name, desc: key.description})
                        }
                        self.paramsForm = list;
                    }).catch(function (err) {
                    });
                }
            },
            saveConfigManage() {
                this.dialogEdit = false;
                this.userConfig[this.currentSetId] = this.configForm;
            },
            removeConfigParam(index){
                this.configForm.splice(index,1)
            },
            addConfigParam(){
                this.configForm.splice(0,0,{name: '', value: ''})
            },
            editConfig(self){
                this.currentSetId = self.id;
                this.configForm = [];
                this.dialogEdit = true;
                if(this.userConfig[self.id]){
                    this.configForm = this.userConfig[self.id]
                }
                else{
                    //新增传入参数 set-id
                    this.getConfigItem({set_id:self.id});
                }
                this.getConfigParams();
            },
            getConfigItem(self){
                getTestPlanConfig(self).then(i=>{
                    if(i.data.code == 0){
                        for(var key in i.data.set_config){
                            this.configForm.push({name: key, value: ''+i.data.set_config[key], description:''})
                        }
                    }else{
                        this.$message.error(i.data.msg)
                    }
                });
            },
            goToList(){
                this.$router.push({
                    path: 'autoTest/testPlan',
                    name: 'testPlanList',
                })
            },
            convertSetupForm(setup){
                try {
                    this.setupForm = setup;
                    for(let key in this.setupForm){
                        let tmp = [];
                        let value = this.setupForm[key];
                        for(let it in value){
                            for(let i in value[it]){
                                if(value[it][i]){
                                    tmp.push(i);
                                }
                            }
                        }
                        this.$set(this.selectSetup, key, tmp);
                    }
                } catch (e) {
                    this.$message.error('Setup格式不正确!');
                }
            },
            getTaskSet(crt){
                let self = this;
                let targettmp = [];
                getTestsetList({
                    id_title: true,
                    project_id: crt.project_id
                }).then(function (response) {
                    let set_ids = [].concat(crt.set_ids).reverse();
                    let sets = response.data.sets;
                    set_ids.forEach(function(id){
                        let tmp = sets.findIndex((item)=>{
                            return item.id === id;
                        });
                        if(tmp !== -1){
                            targettmp.push(sets[tmp]);
                            sets.splice(tmp,1);
                        }
                    })
                    self.source = {name: '',module: '',type: '',setList: [],num: 20};
                    self.target = {name: '',module: '',type: '',setList: [],num: 20};
                    self.source.setList = sets;
                    self.target.setList = targettmp;
                }).catch(function (err) {
                });
            },
            saveTestPlanManage() {
                let ref = this;
                if (ref.validateFormRule('form') && ref.checkChooseSet()) {
                    ref.form.setup_teardown = ref.setupForm;
                    let obj = {};
                    if(ref.targetTmp&&ref.targetTmp.length){
                        ref.targetTmp.map(item=>{
                            if(ref.userConfig[item.id]){
                                obj[item.id] = {};
                                if(ref.userConfig[item.id]&&ref.userConfig[item.id].length){
                                    ref.userConfig[item.id].map(it=>{
                                        obj[item.id][it.name] = it.value;
                                    })
                                }
                            }
                        })
                    }
                    ref.form.user_config = obj;
                    //id大于0为编辑，小于等于0为新增
                    if(ref.form.id > 0){
                        updateTestPlan(ref.form.id, ref.form).then(function (response) {
                            if (response.data.code === 0) {
                                ref.$message.success("提交成功！");
                                ref.goToList();
                            }
                            else {
                                ref.$message.error(response.data.msg);
                            }
                        })
                    }
                    else {
                        createTestPlan(ref.form).then(function (response) {
                            if (response.data.code === 0) {
                                ref.$message.success("提交成功！");
                                ref.goToList();
                            }
                            else {
                                ref.$message.error(response.data.msg);
                            }
                        })
                    }
                }
                else{
                    return false;
                }
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
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getCaseType(){
                let self = this;
                getCaseTypeList().then(function (response){
                    self.caseTypeList = response.data.types;
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                let self = this;
                if(flag == true){
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
                        version_id: self.form.version_id
                    }).then(function (response) {
                        self.moduleList = response.data.module;
                    });
                }
            },
            getSet(){
                let self = this;
                this.source.setList = [];
                getTestsetList({
                    id_title: true,
                    project_id: this.form.project_id,
                    version_id: this.form.version_id
                }).then(function (response) {
                    let sets = response.data.sets;
                    if(self.target.setList.length > 0){
                        self.source.setList = sets.filter((item)=>{
                            for(let target of self.target.setList){
                                if(target.id === item.id){
                                    return false;
                                }
                            }
                            return true;
                        });
                    }
                    else{
                        self.source.setList = sets;
                    }
                }).catch(function (err) {
                });
            },
            getConfigKey(item){
                item.optionList = this.paramsForm;
            },
            sourceLoadMore(scrollPosition){
                let tmp = this.sourceTmp.length - this.sourceShowList.length;
                let step = (tmp > 20) ? 20 : tmp;
                this.source.num += step;
                if(step > 0){
                    this.$nextTick(()=>{
                        this.$nextTick(()=> {
                            this.$nextTick(() => {
                                document.querySelector(".sourceShowList .el-table__body-wrapper").scrollTop = scrollPosition;
                            })
                        })
                    })
                }
            },
            sourceSelectAll(val){
                if(val.length === 0){
                    return
                }
                if((this.source.name === '')
                    && (this.source.module === '')
                    && (this.source.type === '')){
                    this.sourceSelection = this.source.setList;
                }
                else{
                    this.sourceSelection = this.sourceTmp;
                }
            },
            sourceSelectionChange(val){
                this.sourceSelection = val;
            },
            sourceToTarget(){
                this.source.setList = this.source.setList.filter((item)=>{
                    for(let select of this.sourceSelection){
                        if(select.id === item.id){
                            return false;
                        }
                    }
                    return true;
                });
                this.target.setList = this.sourceSelection.concat(this.target.setList);
            },
            targetLoadMore(scrollPosition){
                let tmp = this.targetTmp.length - this.targetShowList.length;
                let step = (tmp > 20) ? 20 : tmp;
                this.target.num += step;
                if(step > 0) {
                    this.$nextTick(() => {
                        this.$nextTick(() => {
                            this.$nextTick(() => {
                                document.querySelector(".targetShowList .el-table__body-wrapper").scrollTop = scrollPosition;
                            })
                        })
                    })
                }
            },
            targetSelectAll(val){
                if(val.length === 0){
                    return
                }
                if((this.target.name === '')
                    && (this.target.module === '')
                    && (this.target.type === '')){
                    this.targetSelection = this.target.setList;
                }
                else{
                    this.targetSelection = this.targetTmp;
                }
            },
            targetSelectionChange(val){
                this.targetSelection = val;
            },
            targetToSource(){
                this.target.setList = this.target.setList.filter((item)=>{
                    for(let select of this.targetSelection){
                        if(select.id === item.id){
                            return false;
                        }
                    }
                    return true;
                });
                this.source.setList = this.targetSelection.concat(this.source.setList);
            },
            setupInForm(set_id){
                if(this.setupForm[set_id]){
                    let result = [];
                    let setup = this.setupForm[set_id];
                    for(let key in setup){
                        for(let t in setup[key]){
                             if(setup[key][t] == 1){
                                result.push(t);
                            }
                        }
                    }
                    return result.join(',')
                }
                else{
                    return ''
                }
            },
            getSetup(row){
                let self = this;
                getSetup({config_id: row.config_id}).then(function(response){
                    if(response.data.code === 0) {
                        response.data.setup.map(item=>{
                            item['setup'] = 'setup'
                        })
                        response.data.teardown.map(item=>{
                            item['teardown'] = 'teardown'
                        })
                        self.setupList = [
                            {
                                label: 'Setup',
                                options: response.data.setup
                            },
                            {
                                label: 'Teardown',
                                options: response.data.teradown
                            }];
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                })
            },
            choosedSetup(row){
                var tempSetup = {};
                var tempTeardown = {};
                this.setupList.map(item=>{
                    for(var i in item){
                        if(item['options']&&item['options'].length){
                         item['options'].map(ite=>{
                             this.selectSetup[row.id].map(it=>{
                                if(ite.name == it){
                                    if(ite.setup == 'setup'){
                                        tempSetup[ite.name] = 1
                                    }else{
                                        tempTeardown[ite.name] = 1
                                    }
                                }else{
                                    if(!tempSetup[ite.name]&&!tempTeardown[ite.name]){
                                        if(ite.setup == 'setup'){
                                            tempSetup[ite.name] = 0
                                        }else{
                                            tempTeardown[ite.name] = 0
                                        }
                                    }
                                }
                             })
                         })
                        }
                    }
                })
                this.$set(this.setupForm, row.id, {"setup":tempSetup,"teardown":tempTeardown});
            },
            checkChooseSet(){
                if(this.target.setList.length === 0){
                    this.$notify.error("请至少选择一个测试集！");
                    return false;
                }
                let tmp = this.getIdFromList(this.target.setList);
                this.form.set_ids = tmp.reverse();
                return true;
            },
            getIdFromList(list){
                let tmp = [];
                list.forEach(function(item){
                    tmp.push(item.id)
                })
                return tmp;
            },
            resetForm(){
                if(this.$refs["form"] != undefined) {
                    this.$refs["form"].resetFields();
                    this.form = {
                        id: 0,
                        title: '',
                        project_id: '',
                        version_id: '',
                        set_ids: [],
                        setup_teardown: ''
                    };
                }
                this.source = {name: '',module: '',type: '',setList: [],num: 20};
                this.target = {name: '',module: '',type: '',setList: [],num: 20};
                this.selectSetup = {};
                this.userConfig = {};
                this.setupForm = {}
            },
            renderTargetHeader(h, { column, $index }){
                return h('span', [
                        h('span', "操作"),
                        h('span', {style: "float: right"}, this.targetSelection.length + "/" + this.targetTmp.length),
                    ],
                )
            },
            renderSourceHeader(h, { column, $index }){
                return h('span', [
                        h('span', "Setup & Teardown"),
                        h('span', {style: "float: right"}, this.sourceSelection.length + "/" + this.sourceTmp.length),
                    ],
                )
            },
            handleRowClick(row, event, column) {
                this.getSetup(row);
            }
        },
        beforeDestroy() {
            this.$store.dispatch('app/toggleParentNav')
        }
    }
</script>

<style scoped>
    .leftOrRight{
        border: 1px solid #DCDFE6;
        background-color: #F5F7FA;
        color: #C0C4CC;
    }
    .el-textarea.is-disabled .el-textarea__inner {
        color: #606266;
        border: none;
        width: 100%;
    }

    .block {
        float: left;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }

    ._caseStep{
        display:block;
        line-height: 20px;
        word-break: break-all;
        word-wrap: break-word;
        text-indent:4em;
    }

    ._configTitle{
        font-size: 16px;
        margin: 10px 0;
    }

    ._configForm{
        margin-left: 10%;
        width: 80%;
    }

    .link-in-table{
        color: #0066cc;
        text-decoration: none;
    }

    .link-in-table:hover{
        color: #008489;
        text-decoration: underline;
    }

    .sourceShowList .el-select {
        display: none
    }
    .sourceShowList .current-row .el-select {
        display: block
    }
    .sourceShowList .current-row .el-select+span {
        display: none
    }

    .targetShowList .el-select {
        display: none
    }
    .targetShowList .current-row .el-select {
        display: block
    }
    .targetShowList .current-row .el-select+span {
        display: none
    }
</style>
