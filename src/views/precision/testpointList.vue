<template>
    <div id="content">
        <el-row>
            <advance-filter :formData="form2" :filterArray="filterArray" @search="seachCond"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="pageList.programData"  height="680" border class='_table' header-cell-class-name="_table-head">
                <el-table-column type="index" width="90" label="序号"></el-table-column>
                <el-table-column show-overflow-tooltip prop="name" label="用例名称"></el-table-column>
                <el-table-column show-overflow-tooltip label="项目">
                    <template slot-scope="props">
                        {{getProjectNameById(props.row.product)}}
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="category" label="用例类型"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

<!--         <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="pageList.count">
            </el-pagination>
        </div> -->

        <el-dialog title="测试用例参数" :visible.sync="viewdialogFormVisible">
            <el-tabs type="border-card">
                    <template v-for="(item,index) in currentRow.config">
                        <el-tab-pane :label="item.key" :key="index">
                            <el-form :key="Math.random()">
                                <el-form-item label="参数说明：" prop="description" :label-width="formLabelWidth">
                                    <span>{{item.description}}</span>
                                </el-form-item>
                                <el-form-item label="是否必选：" prop="require" :label-width="formLabelWidth">
                                    <span>{{requireFormat(item.require)}}</span>
                                </el-form-item>
                                <el-form-item label="参数类型：" prop="type" :label-width="formLabelWidth">
                                    <span>{{typeFormat(item.type)}}</span>
                                </el-form-item>
                                <el-form-item v-if="item.type.indexOf('select') != -1"
                                              label="可选值列表："
                                              :label-width="formLabelWidth">
                                    <span>{{ item.options ? item.options.join(',') : '' }}</span>
                                </el-form-item>
                                <el-form-item v-if="item.require == false"
                                              label="默认值："
                                              :label-width="formLabelWidth">
                                    <span>{{item.default.toString()}}</span>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                    </template>
                </el-tabs>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="viewdialogFormVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="选择素材（请选择文件夹）" :visible.sync="dialogVisible">
            <el-tree
                    :props="props"
                    :load="loadNode"
                    ref="tree"
                    node-key="abspath"
                    style="max-height: 400px;overflow-y: auto;"
                    lazy
                    render-after-expand
                    show-checkbox
                    accordion
                    check-strictly>
            </el-tree>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="choosedMaterial">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="参数配置" :visible.sync="jsonVisible" width="64%" :show-close="!isAddJsonName?true:false">
            <div v-if="!isAddJsonName">
                <el-row>
                    <el-form :inline="true" class="_bottom0 demo-form-inline">
                        <el-col :span="10">
                            <el-form-item>
                                <el-button type="primary" size='mini' @click="gotoAdd" class="el-icon-plus">新增</el-button>
                            </el-form-item>
                            <el-form-item label-width="20px">
                                <el-button type="warning" size="mini" @click="viewDeleteConfig(true)" :disabled="form.product == ''" v-if="form.active_id==false">进入回收站</el-button>
                                <el-button type="warning" size="mini" @click="viewDeleteConfig(false)" v-else>返回配置</el-button>
                            </el-form-item>
                            <el-form-item label-width="120px">
                                <el-checkbox v-model="form.worker_id" border size="mini" @change="viewTask" :disabled="form.product == ''">只看我的</el-checkbox>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item>
                                <el-select
                                    style="width: 140px"
                                    v-model="form.product"
                                    size="mini"
                                    placeholder="项目"
                                    @change="getName">
                                    <el-option v-for="(item,index) in projectList" :label="item.name" :value="''+item.id" :key="index"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-select
                                    style="width: 100px"
                                    v-model="form.config_name"
                                    filterable
                                    @visible-change="getName"
                                    clearable
                                    default-first-option
                                    :disabled="form.product == ''"
                                    size="mini"
                                    placeholder="名称">
                                    <el-option
                                        v-for="item in config_name"
                                        :key="item"
                                        :label="item"
                                        :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-select
                                    style="width: 130px"
                                    v-model="form.creator"
                                    filterable
                                    default-first-option
                                    clearable
                                    placeholder="创建人"
                                    size="mini"
                                    :disabled="form.product == ''">
                                    <el-option
                                        v-for="item in creator"
                                        :key="item"
                                        :label="item"
                                        :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-select
                                    style="width: 130px"
                                    v-model="form.updater"
                                    filterable
                                    default-first-option
                                    size="mini"
                                    placeholder="更新人"
                                    clearable
                                    :disabled="form.product == ''">
                                    <el-option
                                        v-for="item in updater"
                                        :key="item"
                                        :label="item"
                                        :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-date-picker
                                    style="width: 210px"
                                    size="mini"
                                    v-model="form.time"
                                    type="datetimerange"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    :default-time="['00:00:00', '23:59:59']"
                                    :disabled="form.product == ''">
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" size='mini' circle @click="seachCondition" icon="el-icon-search"></el-button>
                            </el-form-item>
                        </el-col>
                    </el-form>
                </el-row>
                <el-table :data="tableList" class="_table" style="max-height: 380px" @selection-change="chooseJsonName">
                    <el-table-column type="selection" v-if="form.active == '1'"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="config_name" label="名称"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="creator" label="创建人"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="updater" label="更新人"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="create_time" label="创建时间"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="update_time" label="更新时间"></el-table-column>
                    <table-operator v-if="!this.form.active_id" :operateArray="operateArray2"></table-operator>
                    <table-operator v-else :operateArray="operateArray3"></table-operator>
                </el-table>
                <!-- 分页 -->
                <div class="_left" >
                    <el-pagination @size-change="handleConfigSizeChange" @current-change="handleConfigCurrentChange" :current-page="configPageNum"
                    :page-sizes="[10, 50, 100, 300]"
                    :page-size="configPageNums" layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
                    </el-pagination>
                </div>
            </div>
            <div v-if="isAddJsonName">
                <el-form :model="addForm" class="_bottom0 demo-form-inline" key="case-form" ref="addForm">
                    <el-col :span="24" style="margin-bottom: 14px;z-index: 1;position: relative;">
                        <el-col :span="12">
                            <el-form-item label="名称"
                                :rules="{ required: true, message: '请选择名称', trigger: 'change' }" 
                                prop="config_name">
                                    <el-input style="width: 350px" v-model.trim="addForm.config_name" size="small" :disabled="flag == 'view'"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="项目" 
                                :rules="{ required: true, message: '请选择项目', trigger: 'change' }" 
                                prop="product">
                                    <el-select
                                        style="width: 180px"
                                        v-model="addForm.product"
                                        :disabled="flag == 'view'"
                                        size="small">
                                            <el-option v-for="(item,index) in projectList" :label="item.name" :value="''+item.id" :key="index"></el-option>
                                    </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="4">
                            <el-form-item v-if="flag == 'add'">
                                <el-upload
                                    class="upload-demo"
                                    ref="upload"
                                    action="/"
                                    :limit='1'
                                    :show-file-list='false'
                                    :before-upload="beforeFileUpload"
                                    :auto-upload='true'
                                    :http-request="handleUpload">
                                <el-tag slot="trigger">JSON文件导入</el-tag>
                                </el-upload>
                            </el-form-item>
                        </el-col>
                    </el-col>
                    <el-form-item 
                        :rules="{ required: true, message: 'JSON不可以为空', trigger: 'change' }" 
                        prop="jsonContent">
                            <div class="_caseJson">
                                <json-editor v-model="addForm.jsonContent" key="caseJson" :isReadOnly="isReadOnly"></json-editor>
                            </div>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer" class="dialog-footer" v-show="isAddJsonName">
                <el-button @click="isAddJsonName = false">取 消</el-button>
                <el-button type="primary" @click="addJsonName" v-if="flag != 'view'">提 交</el-button>
            </div>
            <div slot="footer" class="dialog-footer" v-show="!isAddJsonName">
                <el-button @click="jsonVisible = false">取 消</el-button>
                <el-button type="primary" @click="choosedJson">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="用例参数配置" :visible.sync="dialogFormVisible" @close="handCloseCaseConfig">
                <el-tabs v-model="activeTab" closable
                                    size="mini"
                                    tab-position="top" @tab-remove="removeTestPoint" 
                                    style="margin-bottom:10px;height: 390px;overflow: auto;background: #fff;padding: 0 10px"
                                    @tab-click="setCheckedKeys" v-if="editPointConfig.testPoint&&editPointConfig.testPoint.length">
                    <el-tag class="_configTitle">参数配置</el-tag>
                    <div v-for="(point_item,point_index) in editPointConfig.testPoint" :key="point_index">
                        <el-tab-pane :label="point_item" :key="point_item+'_'+point_index" :name="''+point_index"  size="mini">
                            <el-form :model="editPointConfig.para[point_index]" ref="pointConfigRef"  size="mini" style="width:90%">
                                <el-form-item v-for="(item,index) in editPointConfig.para[point_index]['form']" :label="item.key" label-width="150px" :prop="'form.'+index+'.value'"
                                                :key="item.key+'_'+point_index"
                                                :rules="{required: item.require,message: '此项不能为空',trigger: item.type.indexOf('select')===-1?'blur':'change'}">
                                    
                                    <div v-if="item.type === 'file'">
                                        <el-col>
                                            <div contenteditable="true" v-if="item['value']&&item['value']!==''" @click="focusOnFileInput(point_index,index,item.key)" >
                                                <el-tag
                                                        v-for="(tag,tag_index) in item['value'].split(',')"
                                                        :key="tag_index"
                                                        closable
                                                        :disable-transitions="false"
                                                        size="small"
                                                        @close="handleClose(index,point_index,tag)"> {{tag}}
                                                </el-tag>
                                            </div>
                                            <el-input 
                                                    v-else
                                                    @focus="focusOnFileInput(point_index,index,item.key)"
                                                    :placeholder="item.default"  size="small">
                                            </el-input>
                                        </el-col>
                                    </div>
                                    <el-input
                                            v-else-if="item.type === 'json'"
                                            readonly
                                            v-model="item['value']"
                                            auto-complete="off"
                                            @focus="focusOnProInput(point_index,index,item)"
                                            :title="item.description"
                                            :placeholder="item.default" size="small"></el-input>
                                    <el-select
                                        style="width:100%"
                                        v-else-if="item.type === 'single_select'"
                                        v-model="item['value']"
                                        :title="item.description"
                                        :placeholder="item.default">
                                        <el-option v-for="op in item.options" :value="op" :label="''+op" :key="op"></el-option>
                                    </el-select>
                                    <el-select
                                            style="width:100%"
                                            v-else-if="item.type === 'multi_select'"
                                            multiple v-model="item['value']"
                                            :title="item.description"
                                            :placeholder="item.default">
                                        <el-option v-for="multiop in item.options" :value="multiop" :label="''+multiop" :key="multiop"></el-option>
                                    </el-select>
                                    <el-input
                                            v-else
                                            v-model="item['value']"
                                            auto-complete="off"
                                            :title="item.description"
                                            :placeholder="item.default" size="small"></el-input>
                                </el-form-item>
                                <el-tag class="_configTitle">邮件发送至(请填写完整邮件地址，以英文逗号分隔)</el-tag>
                                <el-form-item label="邮件发送至" label-width="150px">
                                    <el-input v-model="to_mail" title="请输入收件人邮箱地址，以英文逗号分隔" ></el-input>
                                </el-form-item>
                                <el-form-item label="抄送至" label-width="150px" >
                                    <el-input v-model="cc_mail" title="请输入抄送人邮箱地址，以英文逗号分隔" ></el-input>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                    </div>
                </el-tabs>
            <br/>
            <div slot="footer" class="dialog-footer" >
                <div>
                    <el-button @click="handCloseCaseConfig">取 消</el-button>
                    <el-button type="primary" @click="confirmRunSuite">确定执行</el-button>
                </div>
            </div>
            </el-dialog>
            <el-dialog title="用例方案" :visible.sync="descriptionVisible" width="40%" >
                <div style="max-height: 400px;overflow-y: auto;">
                    <div v-if="caseScenario.length===0">
                        <span style="text-aligin:center;">暂无数据</span>
                    </div>
                    <ul v-else v-for="(item,index) in caseScenario" :key="index">
                        <li>{{item}}</li>
                    </ul>
                </div>

                <div slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="descriptionVisible = false">确 定</el-button>
                </div>
            </el-dialog>
    </div>
</template>
<script>
    import { mapGetters } from "vuex";
    import AdvanceFilter from "../../components/AdvanceFilter/index";
    import TableOperator from "../../components/TableOperator/index";
    import { FilterProject, FilterVersion, FilterModule } from '@/common/index';
    import { getProjectList } from '@/api/project';
    import { getSceneList, getTestPoint, deletePoint,createNewTask } from '@/api/precision';
    import { getAllName, getConfigList, configEditGet, configListEditPost, getRemoveConfig, getAddConfig, configRestore } from '@/api/precision';
    import moment from 'moment' //引入moment化简时间
    import axios from 'axios'
    const rootPath = process.env.BASE_API;
    import Cookies from "js-cookie";
    import { getMaterialList } from '@/api/others';
    import JsonEditor from '@/components/JsonEditor';
    export default {
        name: 'testPointList',
        components: { JsonEditor,TableOperator,AdvanceFilter},
        data() {
            return {
                descriptionVisible:false,
                isUpload:true,
                to_mail:'',
                cc_mail:'',
                setCheckedList:{},
                currentPonit_index:"",
                currentIndex:'',
                activeTab: '0',
                flag:'',
                total:0,
                configPageNums: 10,//每页几条
                configPageNum: 1, //当前是第几页
                editPointConfig:{
                    mail:{
                        to_mail:[],
                        cc_mail:[],
                    },
                    product:"",
                    testPoint: ['y'],
                    para: [{
                        form: []
                    }],
                },
                dialogFormVisible:false,
                config_name:[],
                creator:[],
                updater:[],
                tableList:[],
                addForm:{
                    product:'',
                    config_name:'',
                    jsonContent:'',
                },
                form:{
                    config_name:'',
                    product:'',
                    creator:'',
                    updater:'',
                    time:'',
                    worker_id:false,
                    active_id:false,
                    active:'1'
                },
                isAddJsonName:false,
                jsonVisible:false,//json配置
                props: {
                    label: 'name',
                    isLeaf: 'leaf'
                },
                dialogVisible:false,//素材
                form2: {
                    project_id: '',
                    scene_id: '',
                },
                projectList: [],
                sceneList: [],
                pageNums: 20,//每页几条
                pageNum: 1, //当前是第几页
                pageList: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                viewdialogFormVisible: false,
                formLabelWidth: "120px",
                currentRow: {},
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject,change:()=>{this.form2.scene_id='';}},
                    {key:'scene_id',name:'用例类型',type:'select',optionList:[],visible: this.getFilterScene,disable:()=>{return this.form2.project_id===''}},
                ],
                operateArray: [
                    {label:'执行', click:this.submitTask},
                    {label:'用例参数', type:"primary", click:this.viewDetail},
                    {label:'用例方案', type:"primary", click:this.viewDescription}
                ],
                operateArray2: [
                    {label:'查看',type:"primary",click:this.viewConfig},
                    {label:'编辑', click:this.editConfig},
                    {label:'删除', type:"danger", click:this.deleteConfig},
                ],
                operateArray3: [
                    {label:'查看',type:"primary",click:this.viewConfig},
                    {label:'恢复', click:this.restore},
                    {label:'删除', type:"danger", click:this.deleteConfig},
                ],
                isReadOnly:false,
                caseScenario:[],
            }
        },

        computed: {
            ...mapGetters(['name']),
        },

        mounted() {
            this.getParams();
        },

        methods: {
            getFilterProject(item){
                FilterProject(item)
            },
            restore(item){
                configRestore({product:item.product,cfg_name:item.config_name}).then(e=>{
                    if(e.data.code == 0){
                        this.$message.success('恢复成功!')
                        this.seachCondition();
                    }else{
                        this.$message.error(e.data.msg)
                    }
                })
            },
            deleteConfig(item){
                this.$confirm(this.form.active == '1'?'此操作可以在已删除配置中恢复, 是否继续?':'此操作在无法恢复, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    getRemoveConfig({product:item.product,cfg_name:item.config_name}).then(e=>{
                        if(e.data.code == 0){
                            this.$message.success('删除成功！')
                            this.seachCondition();
                        }else{
                            this.$message.error(e.data.msg)
                        }
                    })
                })
            },
            editConfig(item){
                this.isReadOnly=false;
                this.flag = 'edit';
                this.currentConfig = item;//保存当前item edit接口需要
                this.isAddJsonName = true;
                this.configEdit(item);
            },
            viewConfig(item){
                this.isReadOnly=true;
                this.flag = 'view'
                this.isAddJsonName = true;
                this.configEdit(item);
            },
            configEdit(item){
                configEditGet({product:item.product,cfg_name:item.config_name}).then(e=>{
                    if(e.data.code == 0){
                        this.addForm = {
                            product:e.data.results.product,
                            config_name:e.data.results.config_name,
                            jsonContent:e.data.results.config_data
                        }
                    }else{
                        this.$message.error(e.data.msg)
                    }
                })
            },
            setCheckedKeys() {
                if(this.$refs.tree) {
                    this.defaultExpand = false;
                    for (var i = 0; i < this.$refs.tree.store._getAllNodes().length; i++) {
                        this.$refs.tree.store._getAllNodes()[i].expanded = this.defaultExpand;
                    }
                }
            },
            addJsonName(){
                if(this.validateFormRule(this.$refs.addForm)){
                    if(this.flag == 'edit'){
                        configListEditPost({
                            creator:this.currentConfig.creator,
                            product:this.addForm.product,
                            cfg_name:this.currentConfig.config_name,
                            update_data:this.addForm.jsonContent,
                            update_name:this.addForm.config_name
                        }).then(e=>{
                            if(e.data.code==0){
                                this.isAddJsonName = false;
                                this.$message.success('更新成功！')
                            }else{
                                this.$message.error(e.data.msg)
                            }
                        })
                    }else{
                        getAddConfig({
                            product:this.addForm.product,
                            cfg_name:this.addForm.config_name,
                            cfg_data:this.addForm.jsonContent,
                        }).then(e=>{
                            if(e.data.code == 0){
                                this.$message.success('新增成功！')
                                this.isAddJsonName = false;
                                this.seachCondition()
                            }else{
                                this.$message.error(e.data.msg)
                            }
                        })
                    }
                }
            },
            validateFormRule(form){
                let result = false;
                form.validate((valid) => {
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
            chooseJsonName(val){
                this.jsonName = val;
            },
            resetCaseForm(){
                this.editPointConfig = {
                    mail:{
                        to_mail:[],
                        cc_mail:[],
                    },
                    product:"",
                    testPoint: ['y'],
                    para: [{
                        form: []
                    }],
                }
            },
            confirmRunSuite(){
                if(this.validateForm("pointConfigRef")){
                    this.editPointConfig.mail.to_mail = (this.to_mail=== "") ? [] : this.to_mail.split(',');
                    this.editPointConfig.mail.cc_mail = (this.cc_mail=== "") ? [] : this.cc_mail.split(',');
                    this.dialogFormVisible = false;
                    //执行
                    let obj = {
                        product:this.editPointConfig.product,
                        name:this.editPointConfig.name,
                        description:this.editPointConfig.description,
                        config:this.editPointConfig.para[0].form,
                        setup:[],
                        suite:[],
                        case:[],
                    }
                    createNewTask({
                    data:obj,mail:this.editPointConfig.mail
                    }).then((response) =>{
                        if(response.data.code === 0){
                            this.$message.success("任务提交成功，后台正在运行，请稍后到任务中心查看相关信息！");
                            this.resetCaseForm();
                        }
                        else{
                            this.$message.error(response.data.msg);
                        }
                    })
                }
            },
            seachCondition() {
                this.configPageNum = 1;
                this.getConfigData();
            },
            getConfigData(){
                let self = this;
                getConfigList({
                        product:self.form.product,
                        page:self.configPageNum,
                        page_size:self.configPageNums,
                        time:self.form.time == null?'':JSON.stringify(self.form.time),
                        cfg_name:self.form.config_name,
                        creator:self.form.creator,
                        updater:self.form.updater,
                        active:self.form.active
                    }).then(e=>{
                        if(e.data.code == 0){
                            self.tableList = e.data.results.result;
                            self.total = e.data.results.total;
                        }else{
                            self.tableList = [];
                            self.$message.error(e.data.msg)
                        }
                })
            },
            getName(){
                this.form.creator = '';
                this.form.updater = '';
                this.form.time = '';
                this.form.worker_id = false;
                getAllName({
                        product:this.form.product,
                        active:this.form.active
                    }).then(e=>{
                    if(e.data.code == 0){
                        this.creator=e.data.results.creator_list;
                        this.updater=e.data.results.updater_list;
                        this.config_name = e.data.results.cfg_name_list;
                    }else{
                        this.$message.error(e.data.msg)
                    }
                })
                this.seachCondition();
            },
            focusOnProInput(point_index,index,item){
                if(this.editPointConfig.product == '') return this.$message.error('请先填写项目!');
                this.currentPonit_index = point_index;
                this.currentIndex = index;
                this.jsonVisible = true;
                this.isAddJsonName = false;
                this.form.product = this.editPointConfig.product;
                this.getName();
                this.seachCondition();
            },
            handleClose(index,point_index,tag){
                let tmp = this.editPointConfig.para[point_index]['form'][index]["value"].split(',')
                tmp.splice(tmp.indexOf(tag),1);
                this.editPointConfig.para[point_index]['form'][index]["value"] = tmp.join(',')
            },
            focusOnFileInput(point_index,index,key){
                for(let i in this.setCheckedList){
                    this.setCheckedList[i].map(it=>{
                        this.$refs.tree.setChecked(it,false)
                    })
                }
                let tem = [];
                let temList = this.editPointConfig.para[point_index].form[index].value.split(',');
                if(temList.join('') !== ''){
                    if(temList&&temList.length){
                        temList.map(item=>{
                            tem.push(item.split('/').slice(1).join('/'))
                        })
                        this.setCheckedList[key] = tem;
                    }
                }else{
                   for(let i in this.setCheckedList){
                       if(i&&i == key){
                           this.setCheckedList[i] = [];
                       }
                    }
                }
                for(let i in this.setCheckedList){
                    if(i&&(key==i)){
                        this.setCheckedList[i].map(it=>{
                            this.$refs.tree.setChecked(it,true)
                        })
                        
                    }
                }
                this.dialogVisible = true;
                this.focusedInput = {point_index: point_index, index: index};
            },
            removeTestPoint(tabName){
                let index = parseInt(tabName);
                let active = parseInt(this.activeTab);
                this.editPointConfig.testPoint.splice(index,1);
                this.editPointConfig.para.splice(index,1);
                if ((active > index) || (active === this.editPointConfig.testPoint.length)) {
                    active -= 1;
                }
                if(active < 0){
                    active = 0;
                }
                this.activeTab = active.toString();
            },
            choosedJson(){
                let temp = [];
                this.jsonName&&this.jsonName.length&&(this.jsonName.map(item=>{
                    temp.push(item.config_name)
                }))
                this.editPointConfig.para[this.currentPonit_index].form[this.currentIndex].value = temp.join(',');
                this.jsonVisible = false;
            },
            handleUpload(item){
                if(!this.isUpload) return false
                let formData = new FormData();
                formData.append('file', item.file);
                let self = this;
                axios.post(
                    rootPath + '/precision/config/localLoad?product=' + self.addForm.product + '&cfg_name=' + self.addForm.config_name,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'uidNumber': Cookies.get("uidNumber"),
                            'token': Cookies.get("token"),
                            'platform': Cookies.get("platform")
                        }
                    }).then(function (res) {
                        if(res.data.code === 0){
                            self.addForm.jsonContent = res.data.result.config_data;
                        } else {
                            self.$notify({
                                message: "文件" + name + "上传失败：" + res.data.msg,
                                type: 'error'
                            });
                        }
                        self.$refs.upload.clearFiles()
                })
            },
            beforeFileUpload(file){
                this.isUpload = true;
                if(this.addForm.config_name == ''||this.addForm.product==''){
                   this.$message.error('缺少参数!');
                   this.isUpload = false; 
                   return false
                }
                //上传之前判断是不是json文件
                if(file.name.split('.')[file.name.split('.').length-1]!='json'){
                    this.$message.error(file.name+' 不是json文件!');
                    this.isUpload = false;                   
                    return false
                }
            },
            viewDeleteConfig(active_id){
                if(active_id){
                    this.form.active_id=active_id;
                    this.form.active = '0';
                }else{
                    this.form.active_id=active_id;
                    this.form.active = '1';
                }
                this.seachCondition();
            },
            viewTask(){
                this.form.worker_id?this.form.creator = this.name:this.form.creator = '';
                this.seachCondition();
            },
            gotoAdd(){
                this.isReadOnly=false;
                this.addForm = {
                    product:this.form.product,
                    config_name:'',
                    jsonContent:''
                };
                this.isAddJsonName = true;//新增json页面
                this.flag = 'add';
            },
            getUrlPath(node,list){
                if(node.parent.data === undefined)
                {
                    list.push(node.data.name);
                }
                else
                {
                    this.getUrlPath(node.parent,list);
                    list.push(node.data.name);
                }
            },
            loadNode(node, resolve){
                let result = [];
                if (node.level === 0) {
                    getMaterialList().then(function (response) {
                        if(response.data.code === 0){
                            response.data.materials.forEach(function(item)
                            {
                                result.push({"name": item.name,"abspath":item.abspath})
                            })
                            resolve(result)
                        }
                    })
                }
                if (node.level > 0)
                {
                    let pathlist = [];
                    this.getUrlPath(node,pathlist);
                    let path = pathlist.join('/');
                    getMaterialList({path: path}).then(function (response) {
                        if(response.data.code === 0)
                        {
                            response.data.materials.forEach(function(item)
                            {
                                    result.push({"name": item.name,'abspath':item.abspath})
                            })
                        }
                        if(result === []){
                            node.isLeaf = true;
                        }
                        resolve(result)
                    })
                }
            },
            // 选择素材
            choosedMaterial(){
                let self = this;
                let checkedNodeslist = self.$refs.tree.getCheckedNodes();
                let tmp = [];
                if(self.editPointConfig.para[self.focusedInput.point_index]){
                    if(self.editPointConfig.para[self.focusedInput.point_index]['form'][self.focusedInput.index]["value"]!=='') {
                        tmp = self.editPointConfig.para[self.focusedInput.point_index]['form'][self.focusedInput.index]["value"].split(',')
                    }
                }
                if(checkedNodeslist.length > 0){
                    checkedNodeslist.forEach(function(item){
                        let node = self.$refs.tree.getNode(item.abspath);
                        let nodePathList = [];
                        self.getUrlPath(node, nodePathList);
                        if(tmp.indexOf("material/" + nodePathList.join('/'))===-1){
                            tmp.push("material/" + nodePathList.join('/'));
                        }
                        self.$refs.tree.setChecked(item.abspath,false)
                    })
                }
                self.editPointConfig.para[self.focusedInput.point_index]['form'][self.focusedInput.index]["value"] = tmp.join(',');
                self.dialogVisible = false;
                self.focusedInput = {};
            },
            submitTask(props) {
                this.dialogFormVisible = true;
                this.editPointConfig.product = props.product;
                this.editPointConfig.name = props.name;
                this.editPointConfig.description = props.description;
                props.config&&props.config.length&&(props.config.map(item=>{
                    if(!item.hasOwnProperty('value')){
                        this.$set(item, "value", "");
                    }
                }))
                this.editPointConfig.para[0].form = props.config;
            },
            getParams(){
                this.getProject();
                if(this.$route.params.dataObj){
                    this.form2 = this.$route.params.dataObj;
                }
                this.getListByPage();
            },
            handleSizeChange(val) {
                this.pageNum = 1;
                this.pageNums = val;
                this.getListByPage();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.getListByPage();
            },
            handleConfigSizeChange(val) {
                this.configPageNum = 1;
                this.configPageNums = val;
                this.getConfigData();
            },
            handleConfigCurrentChange(val) {
                this.configPageNum = val;
                this.getConfigData();
            },
            getListByPage() {
                let self = this;
                getTestPoint({
                    page_no: self.pageNum,
                    page_size: self.pageNums,
                    product: self.form2.project_id,
                    sort: self.form2.scene_id,
                }).then(e=>{
                    if(e.data.code == 0){
                        self.pageList  = {
                            page_no: self.pageNum,
                            page_size: 20 || self.pageNums,
                            count: e.data.total,
                            programData:  e.data.results,
                        }
                    }else{
                        self.$message.error(e.data.msg)
                    }
                })
            },
            gotoEdit(self) {
                this.$router.push({
                    path: 'precision/editPoint',
                    name: 'editPoint',
                    params: {
                        dataObj: self
                    }
                })
            },
            viewDetail(self){
                this.currentRow = self;
                this.viewdialogFormVisible = true;
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deletePoint({
                        scene_id: self.scene_id,
                        point_id: self.point_id
                    }).then(function (response) {
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！");
                            ref.getListByPage();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (err) {
                    });
                })
            },
            requireFormat(require){
                if(require == true){
                    return "是"
                }
                else{
                    return "否"
                }
            },
            typeFormat(type){
                switch(type){
                    case "text":
                        return "文本";
                    case "file":
                        return "文件";
                    case "single_select":
                        return "单选";
                    case "multi_select":
                        return "多选";
                    case "env":
                        return "环境变量";
                    case "json":
                        return "JSON";
                    default:
                        return '';
                }
            },
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getFilterScene(item){
                    let self = this;
                    getSceneList({product: self.form2.project_id,}).then(function (response) {
                        let list =[];
                        for(let i of response.data.results){
                             list.push({label:i,value:i});
                        }
                        item.optionList = list;
                    })
            },
            getProjectNameById(id){
                let result = '项目不存在';
                if(this.projectList.length > 0){
                    let tmp = this.projectList.filter(function(item){
                        return item.id == id;
                    })
                    if(tmp.length > 0) {
                        result = tmp[0].name
                    }
                }
                return result
            },
            seachCond() {
                this.pageNum = 1;
                this.getListByPage();
            },
            viewDescription(item){
                this.caseScenario = item.description===''?[]:item.description.split("#");
                this.descriptionVisible = true;
            },
            validateForm(formName){
                let result = false;
                this.$refs[formName][0].validate((valid) => {
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
            handCloseCaseConfig(){
                this.$refs.pointConfigRef[0].resetFields();
                this.dialogFormVisible = false;
            }
        }
    }
</script>
<style scoped>
    ._right {
        display: block;
        float: right;
    }

    ._table {
        height: 690px;
        overflow: auto;
        margin-top: 15px;
    }

    .el-table::before{
        height: 0;
    }

    .block {
        float: right;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }
    ._configTitle{
        font-size: 16px;
        margin: 10px 0;
    }
</style>
