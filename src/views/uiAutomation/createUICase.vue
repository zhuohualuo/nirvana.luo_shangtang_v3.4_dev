<template>
    <div id="content">
        <!--<el-card>-->
        <el-row>
            <el-form :model="formValidate" ref="formValidate" :rules="formRule">
                <el-col :span="6">
                    <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                        <el-select v-model="formValidate.project_id"
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
                <el-col  :span="6">
                <el-form-item label="版本" :label-width="formLabelWidth" prop="version_id">
                    <el-select v-model="formValidate.version_id"
                               :disabled="formValidate.project_id===''"
                               @change="()=>{formValidate.module=''}"
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
                <el-col :span="6">
                    <el-form-item label="模块" :label-width="formLabelWidth" prop="module">
                        <el-select v-model="formValidate.module" clearable
                                   :disabled="formValidate.project_id===''"
                                   @visible-change="getModule">
                            <el-option
                                    v-for="(item,index) in moduleList"
                                    :label="item"
                                    :value="item"
                                    :key="index">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="用例名称" :label-width="formLabelWidth" prop="title">
                        <el-input v-model="formValidate.title" placeholder="请输入用例名称" auto-complete="off"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="目标服务" :label-width="formLabelWidth" prop="server_id">
                        <el-select v-model="formValidate.server_id" placeholder="请选择" @visible-change="getMachine">
                            <el-option
                                    v-for="(item,index) in serverList"
                                    :label="item.title"
                                    :value="item.id"
                                    :key="index">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-form>
        </el-row>
        <el-row>
            <el-table :data="contentList"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <el-table-column type="index" label="步骤" width="55"></el-table-column>
                <el-table-column label="封装页面 / 通用操作" width="250">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.page"
                                   filterable
                                   @visible-change="getPage"
                                   @change="()=>{scope.row.method='';scope.row.content={}}">
                            <el-option v-for="(item,index) in pageList" :label="item" :value="item" :key="index"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="操作方法" width="250">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.method"
                                   filterable
                                   @visible-change="(v)=>{if(v)getFunction(scope.row)}"
                                   @change="(v)=>{choosedFunc(v,scope.row)}">
                            <el-option v-for="(item,index) in funcList" :label="item.name" :value="item.name" :key="index" :title="item.desc"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="请求参数">
                    <template slot-scope="scope">
                        <span>
                            <el-input v-for="(item,index) in scope.row.content"
                                      v-model="scope.row.content[index]"
                                      :placeholder="'请输入'+index"
                                      :key="index"
                                      style="width: 18%;margin: 0 5px">
                            </el-input>
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="operation" label="操作" width="120" align="center" :render-header="renderHeader">
                    <template slot-scope='props'>
                        <el-button @click='removeStep(props.$index)' icon="el-icon-minus" type="danger" size="mini"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <el-row style="margin-top: 8px">
            <el-col :span="4" :offset="10">
                <el-button type="ghost" @click="handleReset()">重置</el-button>
                <el-button type="primary" @click="handleSubmit('formValidate')" style="margin-left: 8px">提交</el-button>
            </el-col>
        </el-row>
        <!--</el-card>-->

        <el-dialog title="编辑请求体" :visible.sync="bodyVisible" width="30%">
            <el-form>
                <el-form-item v-for="(item,index) in tmpBody" :label="index" :label-width="formLabelWidth" :key="index">
                    <el-input v-model="tmpBody[index]" style="width: 80%"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="bodyVisible = false">取 消</el-button>
                <el-button type="primary" @click="editBody">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { addUICase, updateUICase, getUICaseById, getMachineList } from '@/api/webUI';
    import { getPageList, getPageDetail, getMethodList } from '@/api/webUI';

    export default {
        name: "createUICase",
        data () {
            return {
                projectList: [],
                versionList: [],
                moduleList: [],
                serverList: [],
                pageList: [],
                funcList: [],
                filter: {},
                formValidate: {
                    id: 0,
                    project_id: '',
                    version_id: '',
                    module: '',
                    title: '',
                    server_id: '',
                    action: []
                },
                formRule: {
                    project_id: [{ required: true, message: '项目不能为空', trigger: 'change' }],
                    version_id: [{ required: true, message: '版本不能为空', trigger: 'change' }],
                    title: [{ required: true, message: '用例名称不能为空', trigger: 'blur' }],
                },
                tmpBody: {},
                currentRow: {},
                contentList: [{page: "", method: "", content: {}, type: ""}],
                formLabelWidth: '90px',
                bodyVisible: false,
                strategyVisible: false,
                isEdit: false
            }
        },//data
        computed: {
        },//computed
        mounted() {
            this.getParams()
        },
        methods: {
            getParams () {
                // 取到路由带过来的参数
                console.log("$route.params.dataObj",this.$route.params.dataObj)
                console.log("$route.params.filter",this.$route.params.filter)
                this.getProject();
                if(this.$route.params.dataObj){
                    this.formValidate = this.$route.params.dataObj;
                    this.getVersion(true);
                    this.getPage(true);
                    this.convertContent();
                }
                if(this.$route.params.filter){
                    this.filter = this.$route.params.filter;
                }
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                if(flag === true) {
                    let self = this;
                    getVersionList({project_id: self.formValidate.project_id}).then(function (response) {
                        console.log(response)
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getModule(flag){
                if(flag === true) {
                    let self = this;
                    getModuleList({
                        project_id: self.formValidate.project_id,
                        version_id: self.formValidate.version_id
                    }).then(function (response) {
                        console.log(response)
                        self.moduleList = response.data.module;
                    }).catch(function (err) {
                    });
                }
            },
            getMachine(){
                let self = this;
                getMachineList({m_type:1}).then(function (response) {
                    console.log(response)
                    self.serverList = response.data.content;
                }).catch(function (err) {
                });
            },
            getPage(flag){
                if(flag === true) {
                    let self = this;
                    getPageList({
                        project_id: this.formValidate.project_id,
                        version_id: this.formValidate.version_id
                    }).then(function (response) {
                        console.log(response)
                        self.pageList = response.data.content.page_name;
                    }).catch(function (err) {
                    });
                }
            },
            getFunction(row){
                let page = row.page;
                let self = this;
                let tmp = [];
                if(page === "通用操作"){
                    getMethodList({
                        page_name: page
                    }).then(function (response) {
                        console.log(response)
                        if(response.data.code===0){
                            for(var key in response.data.content){
                                let value = response.data.content[key];
                                value.name = key;
                                tmp.push(value)
                            }
                            self.funcList = tmp
                        }
                        else{
                            self.$message.error(response.data.msg)
                        }
                    }).catch(function (err) {
                    });
                }
                else{
                    getPageDetail({
                        page_type: 1,
                        project_id: this.formValidate.project_id,
                        version_id: this.formValidate.version_id,
                        page_name: page
                    }).then(function (response) {
                        console.log(response)
                        if(response.data.code===0){
                            for(var key in response.data.content){
                                let value = response.data.content[key];
                                value.name = key;
                                tmp.push(value)
                            }
                            self.funcList = tmp
                        }
                        else{
                            self.$message.error(response.data.msg)
                        }
                    }).catch(function (err) {
                    });
                }
            },
            choosedFunc(value,row){
                row.content = {};
                let tmp = this.funcList.filter((item)=>{
                    return item.name === value
                })
                if(tmp.length > 0){
                    row.type = tmp[0].type;
                    if(row.type === "typing"){
                        let params = tmp[0].params.split(',');
                        for(var item of params){
                            row.content[item] = '';
                        }
                    }
                }
            },
            clickContent(row, column, cell, event){
                this.currentRow = row;
                if(column.label === '请求参数' && row.type === "typing"){
                    this.tmpBody = Object.assign({},this.currentRow.content);
                    this.bodyVisible = true;
                }
                else{
                    this.$message.info("无需填写！")
                }
            },
            bodyFormat(row){
                let result = "";
                if(row.content && row.type === "typing"){
                    result = JSON.stringify(row.content,null,4)
                }
                return result;
            },
            editBody(){
                this.currentRow.content = this.tmpBody;
                this.bodyVisible = false;
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
            obj2list(content){
                let tmp = [];
                for(var key in content){
                    tmp.push(content[key])
                }
                return tmp
            },
            combineContent(){
                let list = [];
                if(this.contentList.length === 0){
                    this.$message.error("至少包含一个操作!");
                    return false;
                }
                let self =this;
                this.contentList.forEach((item,index)=>{
                    list.push({
                        content: self.obj2list(item.content).join("||"),
                        method: item.method,
                        page: item.page,
                        sequence: index
                    })
                })
                this.formValidate.action = list;
                return true;
            },
            convertFunction(obj,content){
                let tmp = this.funcList.filter((item)=>{
                    return item.name === obj.method
                })
                if(tmp.length > 0){
                    obj.type = tmp[0].type;
                    if(obj.type === "typing"){
                        let params = tmp[0].params.split(',');
                        let values = content.split('||');
                        params.forEach((item,index)=>{
                            obj.content[item] = values[index];
                        })
                    }
                }
                this.contentList.push(obj)
            },
            convertContent(){
                this.isEdit = true;
                this.contentList = [];
                let self = this;
                getUICaseById({id: self.formValidate.id}).then((response)=>{
                    // console.log(response)
                    if(response.data.code === 0){
                        for(let item of response.data.content.action){
                            let obj = {page: item.page, method: item.method, content: {}, type: ""};
                            let tmp = [];
                            if(obj.page === "通用操作"){
                                getMethodList({
                                    page_name: obj.page
                                }).then(function (res) {
                                    // console.log(res)
                                    for(var key in res.data.content){
                                        let value = res.data.content[key];
                                        value.name = key;
                                        tmp.push(value)
                                    }
                                    self.funcList = tmp;
                                    self.convertFunction(obj,item.content);
                                })
                            }
                            else{
                                getPageDetail({
                                    page_type: 1,
                                    project_id: self.formValidate.project_id,
                                    version_id: self.formValidate.version_id,
                                    page_name: obj.page
                                }).then(function (res) {
                                    // console.log(res)
                                    for(var key in res.data.content){
                                        let value = res.data.content[key];
                                        value.name = key;
                                        tmp.push(value)
                                    }
                                    self.funcList = tmp;
                                    self.convertFunction(obj,item.content);
                                })
                            }
                        }
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                }).catch((err)=>{
                })
            },
            handleSubmit(name) {
                console.log(this.formValidate)
                if (this.validateFormRule(name) && this.combineContent()) {
                    //有id表示是做修改，没有表示是新增
                    let ref = this;
                    if (ref.formValidate.id > 0 ){
                        updateUICase(ref.formValidate).then(function (response) {
                            if(response.data.code === 0){
                                ref.$message.success('提交成功!');
                                ref.gotoUICaseList();
                                ref.handleReset();
                            }else{
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                            console.log(error);
                        });
                    }
                    else{
                        addUICase(ref.formValidate).then(function (response) {
                            if(response.data.code === 0){
                                ref.$message.success('提交成功！请在用例列表中查看');
                                ref.handleReset();
                            }else{
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                            console.log(error);
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
                    version_id: '',
                    module: '',
                    title: '',
                    server_id: '',
                    action: []
                }
                this.contentList = [{page: "", method: "", content: {}, type: ""}];
                this.currentRow = {};
                this.tmpBody = {};
            },
            gotoUICaseList() {
                this.$router.push({
                    path: '/webUI/uiCaseList',
                    name: 'uiCaseList'
                })
            },
            addStep(){
                this.contentList.push({page: "", method: "", content: "", type: ""});
            },
            removeStep(index){
                this.contentList.splice(index,1)
            },
            renderHeader(h, { column, $index }){
                return h('el-button', {
                    props: { icon: 'el-icon-plus', type: 'primary', size: 'mini'},
                    on: {
                        click: () => {
                            this.addStep()
                        }
                    }
                })
            },
        }

    }
</script>

<style scoped>
    ._tip{
        padding: 0 16px;
    }
    ._switch {
        margin: 0 0 20px 10px;
    }

</style>