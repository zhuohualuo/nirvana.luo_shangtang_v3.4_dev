<template>
    <div id="content">
        <el-row style="width: 90%;margin-left: 8%">
            <el-form :model="formValidate" :rules="ruleValidate" ref="formValidate" size="small">
                <el-col :span="8">
                    <el-form-item label="任务名称" :label-width="formLabelWidth" prop="title">
                        <el-input v-model.trim="formValidate.title" auto-complete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                        <el-select v-model="formValidate.project_id"
                                   :disabled="isEdit"
                                   @change="formValidate.version_id=''">
                            <el-option
                                    v-for="(item,index) in projectList"
                                    :label="item.name"
                                    :value="item.id"
                                    :key="index">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-form-item label="版本" :label-width="formLabelWidth" prop="version_id">
                        <el-select v-model="formValidate.version_id"
                                   :disabled="formValidate.project_id===''"
                                   @change="getManualCase"
                                   @visible-change="getVersion">
                            <el-option
                                    v-for="(item,index) in versionList"
                                    :label="item.version"
                                    :value="item.id"
                                    :key="index">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-form-item label="优先级" :label-width="formLabelWidth" prop="priority">
                        <el-select v-model="formValidate.priority">
                            <el-option label="高" :value="1"></el-option>
                            <el-option label="中" :value="2"></el-option>
                            <el-option label="低" :value="3"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="任务描述" :label-width="formLabelWidth" prop="description">
                        <el-input v-model="formValidate.description" auto-complete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="备注" :label-width="formLabelWidth" prop="remarks">
                        <el-input v-model="formValidate.remarks" auto-complete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="20">
                    <el-form-item label="子任务负责人" :label-width="formLabelWidth" prop="priority" :rules="[{required: true},{ 
                            validator: (rule, value, callback)=>{validateSku(rule, value, callback)}, 
                            trigger: ['blur', 'change'] 
                        }]">
                        <el-select v-model="caseOwner"
                                   multiple filterable
                                   style="width: 100%;"
                                   @change="choosedCaseOwner"
                                   @remove-tag='removeTag'
                                   @visible-change="getCaseOwner">
                            <el-option
                                    v-for="item in ownerList"
                                    :label="item"
                                    :value="item"
                                    :key="item">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-form>
            <el-col :span="20">
                <el-tabs type="border-card" tab-position="left" style="height: 590px" v-model="activeName" @tab-click="handleClick">
                    <template>
                        <el-tab-pane :label="index" :key="index" :name='index' v-for="(item, index) in subTask">
                            <el-row>
                                <el-col :span="11">
                                    <div class="_right" style="margin-bottom: 5px">
                                        <el-input v-model="source.title"
                                                  placeholder="用例名称"
                                                  prefix-icon="el-icon-search"
                                                  clearable size="mini" style="width: 120px">
                                        </el-input>
                                        <el-input v-model="source.module"
                                                  placeholder="模块"
                                                  prefix-icon="el-icon-search"
                                                  clearable size="mini" style="width: 120px">
                                        </el-input>
                                    </div>
                                    <!-- sourceShowList 为全局函数 -->
                                    <el-table :data="sourceShowList"
                                              height="520" border class='_table sourceShowList' header-cell-class-name="_table-head"
                                              size="mini"
                                              @select-all="sourceSelectAll"
                                              @selection-change="sourceSelectionChange"
                                              v-loadmore="sourceLoadMore">
                                        <el-table-column type="selection"></el-table-column>
                                        <el-table-column show-overflow-tooltip prop="title" :render-header="renderSourceHeader"></el-table-column>
                                    </el-table>
                                </el-col>
                                <el-col :span="2">
                                    <div style="margin-left: 25%; margin-top: 200px">
                                        <el-button type="primary" icon="el-icon-arrow-left" circle @click="targetToSource" :class="targetSelection.length=='0'?'leftOrRight':''"></el-button>
                                    </div>
                                    <br/>
                                    <div style="margin-left: 25%">
                                        <el-button type="primary" icon="el-icon-arrow-right" circle @click="sourceToTarget" :class="sourceSelection.length=='0'?'leftOrRight':''"></el-button>
                                    </div>
                                </el-col>
                                <el-col :span="11">
                                    <div class="_right" style="margin-bottom: 5px">
                                        <el-input v-model="target.title"
                                                  placeholder="用例名称"
                                                  prefix-icon="el-icon-search"
                                                  clearable size="mini" style="width: 120px">
                                        </el-input>
                                        <el-input v-model="target.module"
                                                  placeholder="模块"
                                                  prefix-icon="el-icon-search"
                                                  clearable size="mini" style="width: 120px">
                                        </el-input>
                                    </div>
                                    <!-- targetShowList 这个数据需要筛选 -->
                                    <el-table :data="targetShowList"
                                              height="520" border class='_table targetShowList' header-cell-class-name="_table-head"
                                              size="mini"
                                              @select-all="targetSelectAll"
                                              @selection-change="targetSelectionChange"
                                              v-loadmore="targetLoadMore">
                                        <el-table-column type="selection"></el-table-column>
                                        <el-table-column show-overflow-tooltip prop="title" :render-header="renderTargetHeader"></el-table-column>
                                    </el-table>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                    </template>
                </el-tabs>
            </el-col>
        </el-row>
        <div class="page-footer-right">
            <el-button type="ghost" @click="handleReset()" :disabled="plan.id>0">重置</el-button>
            <el-button type="primary" @click="handleSubmit('formValidate')" style="margin-left: 8px">提交</el-button>
        </div>
    </div>
</template>

<script>
    import { getPlatformMember } from '@/api/login';
    import { getProjectList, getVersionList } from '@/api/project';
    import { getManualCaseList, addManualTask, updateManualTask } from '@/api/manualCase';

    export default {
        name: "createManualTask",
        data() {
            return {
                plan:{},
                subTask:{},
                activeName:'',
                filter: {},
                formValidate: {
                    id: 0,
                    title: '',
                    project_id: '',
                    version_id: '',
                    priority: 2,
                    case_owner: '',
                    description: '',
                    remarks: ''
                },
                caseOwner: [],
                projectList: [],
                versionList: [],
                ownerList: [],
                ruleValidate: {
                    title: [
                        { required: true, message: '用例名称不能为空', trigger: 'blur' }
                    ],
                    project_id: [
                        { required: true, message: '项目不能为空', trigger: 'change' }
                    ],
                    version_id: [
                        { required: true, message: '版本不能为空', trigger: 'change' }
                    ],
                    priority: [
                        { required: true, message: '优先级不能为空', trigger: 'change' }
                    ]
                },
                formLabelWidth: '110px',
                isEdit:false,
                source:{title: '',module: '',caseList: [],num: 20},
                target:{title: '',module: '',caseList: [],num: 20},
                sourceSelection: [],
                targetSelection: [],
                sourceTmp: [],
                targetTmp: [],

            }
        },
        computed:{
            sourceShowList: function(){
                let name = this.source.title.toLowerCase();
                let module = this.source.module.toLowerCase();
                let num = this.source.num;
                this.sourceSelection = [];
                this.sourceTmp = this.source.caseList.filter(function(item){
                    return(
                        (name==="" || item.title.toLowerCase().indexOf(name)>-1)
                        && (module==="" || item.module.toLowerCase().indexOf(module)>-1)
                    )
                })
                return this.sourceTmp.slice(0,num)
            },
            targetShowList: function(){
                let name = this.target.title.toLowerCase();
                let module = this.target.module.toLowerCase();
                let num = this.target.num;
                this.targetSelection = [];
                this.targetTmp = this.target.caseList.filter(function(item){
                    return(
                        (name==="" || item.title.toLowerCase().indexOf(name)>-1)
                        && (module==="" || item.module.toLowerCase().indexOf(module)>-1)
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
            this.plan=JSON.parse(window.sessionStorage.getItem("editSubTaskList"));
            this.getParams();
        },
        methods: {
             validateSku(rule, value, callback){
                if (this.caseOwner.length == 0) {
                    callback(new Error("子任务负责人不能为空"))
                } else {
                    callback();
                }
            },
            handleClick(tab){
                this.target.caseList=this.subTask[tab.label];
            },
            goToList() {
                this.$router.push({
                    name: 'manualTaskList',
                    params: {
                        filter: this.filter
                    }
                })
            },
            getParams() {
                // 取到路由带过来的参数
                this.getProject();
                if(this.$route.params.dataObj){
                    this.formValidate = this.$route.params.dataObj
                }
                else if(JSON.stringify(this.plan)!='{}'){
                    this.formValidate = this.plan
                }
                else{
                    return
                }
                this.getVersion(true);
                this.getManualCase().then(()=>{
                    this.convertSubTask();
                });
                if (this.$route.params.filter) {
                    this.filter = this.$route.params.filter;
                }
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                if(flag === true) {
                    let self = this;
                    getVersionList({project_id: self.formValidate.project_id}).then(function (response) {
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getCaseOwner(flag){
                if(flag === true) {
                    let self = this;
                    getPlatformMember().then(function (response) {
                        self.ownerList = response.data.platform_members;
                    }).catch(function (err) {
                    });
                }
            },
            removeTag(val){
                this.caseOwner.length > 0?this.activeName = this.caseOwner[0]:this.activeName = '';
                this.source.caseList = this.source.caseList.concat(this.subTask[val])
                delete this.subTask[val];
                this.target.caseList = this.subTask[this.activeName]?this.subTask[this.activeName]:[];
                let tmp = {};
                for(let item of this.caseOwner){
                    this.$set(tmp, item, this.subTask[item]?this.subTask[item]:[]);
                }
                this.subTask = tmp;
            },
            choosedCaseOwner(val){
                //添加 数据结构
                val&&val.length == 1&&(this.activeName = val[0])
                val&&val.length&&(val.map(item=>{
                    if(!this.subTask[item]){
                        this.$set(this.subTask, item, []);
                    }
                }))
            },
            async getManualCase(){
                this.source.caseList = [];
                let self = this;
                await getManualCaseList({
                    version_id: this.formValidate.version_id,
                    project_id: this.formValidate.project_id,
                    status: 1
                }).then(function (response) {
                    if(response.data.code === 0){
                        for(let item of response.data.case_maintenance){
                            self.source.caseList.push({id: item.id, title: item.title,module:item.module});
                        }
                        // 先判断 subtask 中是否存在用例 有就 从source.caseList中剔除掉 没有就不执行下面代码
                        Object.values(self.subTask)&&Object.values(self.subTask).length&&(Object.values(self.subTask).map(it=>{
                            it&&it.length&&(it.map(i=>{
                                self.source.caseList.map((e,index)=>{
                                    if(e.id == i.id){
                                        self.source.caseList.splice(index,1)
                                    }
                                })
                            }))
                        }))
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                })
            },
            convertSubTask(){
                try{
                    let self = this
                    let obj = JSON.parse(this.formValidate.case_owner);
                    Object.keys(obj)&&Object.keys(obj).length&&(this.activeName = Object.keys(obj)[0])
                    let arr = self.source.caseList
                    for(let name in obj){
                        this.caseOwner.push(name);
                        self.subTask[name] = [];
                        obj[name].map(ite=>{
                            arr.map((i,index)=>{
                                if(ite == i.id){
                                    self.subTask[name].push(i)
                                    arr.splice(index,1)
                                }
                            })
                        })
                    }
                    self.target.caseList = self.subTask[self.activeName];
                    self.source.caseList = arr;
                }
                catch(e){
                    console.log(e)
                    this.$message.error('子任务数据异常！请联系管理员')
                }
            },
            handleSubmit(name) {
                if (this.validateFormRule(name)) {
                    //有id表示是做修改，没有表示是新增
                    let obj = {}
                    for(var index in this.subTask){
                        let tmp = []
                        for(var val of this.subTask[index]){
                            tmp.push(val.id)
                        }
                        obj[index] = tmp
                    };
                    this.formValidate.case_owner = JSON.stringify(obj)
                    let ref = this;
                    if (ref.formValidate.id > 0 ){
                        updateManualTask(ref.formValidate.id, ref.formValidate).then(function (response) {
                            if(response.data.code === 0){
                                ref.$message.success('提交成功!');
                                ref.goToList();
                            }else{
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                        });
                    }
                    else{
                        addManualTask(ref.formValidate).then(function (response) {
                            if(response.data.code === 0){
                                ref.$message.success('提交成功！请在用例列表中查看');
                                ref.handleReset();
                            }else{
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                        });
                    }
                }
            },
            validateFormRule(name){
                let result = false;
                this.$refs[name].validate((valid) => {
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
            priorityFormat(row, column){
                let priority = row.priority;
                if (priority === undefined || priority === null) {
                    return "";
                }
                switch(priority){
                    case 1:
                        return "高";
                    case 2:
                        return "中";
                    case 3:
                        return "低";
                    default:
                        return "";
                }
            },
            statusFormat(row, column){
                let status = row.status;
                if (status === undefined || status === null) {
                    return "";
                }
                switch(status){
                    case 0:
                        return "禁用";
                    case 1:
                        return "启用";
                    default:
                        return "";
                }
            },
            handleReset () {
                this.$refs["formValidate"].resetFields();
                this.formValidate = {
                    id: 0,
                    title: '',
                    project_id: '',
                    version_id: '',
                    priority: 2,
                    case_owner: '',
                    description: '',
                    remarks: ''
                }
                this.caseOwner = [];
                this.subTask = {};
                this.source.caseList = []
                this.target.caseList = []
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
                if (val.length === 0) {
                    return;
                }
                if((this.source.name === '') && (this.source.module === '') && (this.source.owner === '')){
                    this.sourceSelection = this.source.caseList;
                }
                else{
                    this.sourceSelection = this.sourceTmp;
                }
            },
            sourceSelectionChange(val){
                this.sourceSelection = val;
            },
            sourceToTarget(){
                this.source.caseList = this.source.caseList.filter((item)=>{
                    for(let select of this.sourceSelection){
                        if(select.id === item.id){
                            return false;
                        }
                    }
                    return true;
                });
                this.target.caseList = this.sourceSelection.concat(this.target.caseList);
                this.subTask[this.activeName] = this.target.caseList;
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
                if((this.target.name === '') && (this.target.module === '') && (this.target.owner === '')){
                    this.targetSelection = this.target.caseList;
                }
                else{
                    this.targetSelection = this.targetTmp;
                }
            },
            targetSelectionChange(val){
                this.targetSelection = val;
            },
            targetToSource(){
                this.target.caseList = this.target.caseList.filter((item)=>{
                    for(let select of this.targetSelection){
                        if(select.id === item.id){
                            return false;
                        }
                    }
                    return true;
                });
                this.source.caseList = this.targetSelection.concat(this.source.caseList);
                this.subTask[this.activeName] = this.target.caseList;
            },
            renderSourceHeader(h, { column, $index }){
                return h('span', [
                        h('span', "用例标题（未选择）"),
                        h('span', {style: "float: right"}, this.sourceSelection.length + "/" + this.sourceTmp.length),
                    ],
                )
            },
            renderTargetHeader(h, { column, $index }){
                return h('span', [
                        h('span', "用例标题（已选择）"),
                        h('span', {style: "float: right"}, this.targetSelection.length + "/" + this.targetTmp.length),
                    ],
                )
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
    .block {
        float: right;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }

    ._view {
        border: 1px solid #dcdfe6;
        overflow: hidden;
    }

    ._caseStep{
        display:block;
        line-height: 20px;
        word-break: break-all;
        word-wrap: break-word;
        text-indent:4em;
    }
</style>

<style>
    .el-transfer-panel{
        width: 45%;
    }
    .el-transfer-panel__body{
        height: 430px;
    }
    .el-transfer-panel__list{
        height: 390px !important;
    }
</style>
