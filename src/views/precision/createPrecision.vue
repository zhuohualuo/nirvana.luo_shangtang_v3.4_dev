<template>
    <div id="createPrecision">
        <div>
            <el-col :xs="24" :xl="8">
                <div class="col_left">
                    <el-form :model="stepData" ref="stepFormText">
                        <el-form-item prop="product" label="项目" :label-width="formLabelWidth"
                                        :rules="{ required: true, message: '请选择项目', trigger: 'change' }">
                            <el-select
                                    v-model="stepData.product"
                                    @change="getTaskList">
                                <el-option v-for="(item,index) in projectList" :label="item.name" :value="''+item.id" :key="index"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="测试集名称" prop="name" :label-width="formLabelWidth" style="margin-right:2%"
                                        :rules="{ required: true, message: '请填写测试集名称', trigger: 'blur' }">
                            <el-input v-model.trim="stepData.name"></el-input>
                        </el-form-item>
                        <el-form-item label="测试集描述" :label-width="formLabelWidth" style="margin-right:2%">
                            <el-input v-model.trim="stepData.description"></el-input>
                        </el-form-item>
                        <el-form-item label="公共参数" :label-width="formLabelWidth">
                            <el-button size='mini' icon="el-icon-plus" @click="addPointParam" style="background-color: #43988A;color: #fff;">添加参数</el-button>
                        </el-form-item>
                    </el-form>
                </div>
                <el-tabs v-model="activeTab" closable
                                    size="mini"
                                    tab-position="top" @tab-remove="removeTestPoint" 
                                    style="margin-bottom:75px;height: 505px;overflow: auto;background: #fff;padding: 0 10px"
                                    @tab-click="setCheckedKeys" v-if="stepData.testPoint&&stepData.testPoint.length">
                    <div v-for="(point_item,point_index) in stepData.testPoint" :key="point_index">
                        <el-tab-pane :label="point_item" :key="point_item+'_'+point_index" :name="''+point_index"  size="mini">
                            <el-form :model="stepData.para[point_index]" :ref="point_item+'_'+point_index"  size="mini">
                                <el-form-item v-for="(item,index) in stepData.para[point_index]['form']"
                                                :key="index"
                                                :prop="'form.'+index+'.value'"
                                            >
                                <div style="display: flex;">
                                    <el-input v-model="item.key" placeholder="请输入key" size="small" style="width:130px;"></el-input>
                                    <el-select v-model="item.type" placeholder="请选择"  size="small" style="width:100px;" @change='()=>{item.value = ""}'>
                                        <el-option label="文本" value="text"></el-option>
                                        <el-option label="文件" value="file"></el-option>
                                        <el-option label="JSON" value="json"></el-option>
                                        <el-option label="环境变量" value="env"></el-option>
                                    </el-select>
                                    <div v-if="item.type === 'file'" style="width:300px;">
                                        <el-col>
                                            <div contenteditable="true" class="tag-input-wrapper" v-if="item['value']!==''" @click="focusOnFileInput(point_index,index,item.key)" >
                                                <el-tag
                                                        v-for="(tag,tag_index) in item['value'].split(',')"
                                                        :key="tag_index"
                                                        closable
                                                        :disable-transitions="false"
                                                        size="small"
                                                        :disabled="item.key==''"
                                                        @close="handleClose(index,point_index,tag)"> {{tag}}
                                                </el-tag>
                                            </div>
                                            <el-input 
                                                    v-else
                                                    @focus="focusOnFileInput(point_index,index,item.key)"
                                                    :placeholder="item.default"  
                                                    :disabled="item.key==''"
                                                    size="small">
                                            </el-input>
                                        </el-col>
                                    </div>
                                    <el-input
                                            v-else-if="item.type === 'json'"
                                            class="backgroundColorInput"
                                            readonly
                                            v-model="item['value']"
                                            auto-complete="off"
                                            @focus="focusOnProInput(point_index,index,item)"
                                            :title="item.description"
                                            :disabled="item.key==''"
                                            :placeholder="item.description" size="small"></el-input>
                                    <el-input
                                            v-else
                                            v-model="item['value']"
                                            auto-complete="off"
                                            :title="item.description"
                                            :disabled="item.key==''"
                                            :placeholder="item.default" size="small" style="width:300px;"></el-input>
                                    <el-button @click="gameoverConfig(index)" icon="el-icon-minus" size='mini' type="danger"></el-button>
                                    </div>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                    </div>
                </el-tabs>
            </el-col>

            <el-col :span="1">
                <hr class="hr_status" />
            </el-col>

            <el-col :xs="24" :xl="15">
                <el-form :model="stepData" ref="stepForm2" >
                    <el-form-item label="setup" label-width="70px">
                        <el-select v-model="stepData.setup" multiple placeholder="请选择" @visible-change="getSetup" filterable style="width:93%">
                            <el-option
                            v-for="item in setupList"
                            :key="item.name"
                            :label="item.name"
                            :value="item.name">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="测试用例" label-width="70px" style="width:100%">
                       <el-transfer
                            filterable
                            filter-placeholder="请输入关键字"
                            :titles="['待选用例', '已选用例']"
                            target-order='unshift'
                            v-model="stepData.case"
                            :props="{
                                key: 'name',
                                label: 'name'
                            }"
                            @change="handRightChange"
                            :data="addTestPoint">
                            <span slot-scope="{ option }" style="display: flex;justify-content: space-between;">
                                <span :title="option.name" style="overflow: hidden;text-overflow: ellipsis;">{{ option.name }}</span>
                                <el-button size='mini' type="text" @click="editCaseConfig(option)">编辑</el-button></span>
                        </el-transfer>
                    </el-form-item>
                    <el-form-item label="测试集" label-width="70px">
                        <el-transfer
                            filterable
                            filter-placeholder="请输入关键字"
                            :titles="['待选测试集', '已选测试集']"
                            v-model="stepData.task_ids"
                            target-order='unshift'
                            :data="taskList">
                        </el-transfer>
                    </el-form-item>
                </el-form>
            </el-col>
            <div slot="footer" class="dialog-footer"  style="position:fixed;bottom:0;display: flex;justify-content: space-between;width:80%;">
                <div>
                    <el-form style="display:flex">
                        <el-form-item label="邮件发送至" :label-width="formLabelWidth" style="margin-bottom: 1%;">
                            <el-input v-model="to_mail" title="请输入收件人邮箱地址，以英文逗号分隔" style="width: 300px;" size="small "></el-input>
                        </el-form-item>
                        <el-form-item label="抄送至" :label-width="formLabelWidth" style="margin-bottom: 1%;">
                            <el-input v-model="cc_mail" title="请输入抄送人邮箱地址，以英文逗号分隔" style="width: 300px;" size="small "></el-input>
                        </el-form-item>
                    </el-form>
                </div>
                <div>
                    <el-button type="primary" plain @click="resetForm">重 置</el-button>
                    <el-button type="primary" @click="savePerfManage">提 交</el-button>
                </div>
            </div>
         </div>
            
        <el-dialog title="选择素材（请选择文件夹）" :visible.sync="dialogVisible"  width="40%">
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
                        <el-col :span="12">
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
                    <el-table-column show-overflow-tooltip prop="config_name" label="参数名称"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="creator" label="创建人"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="updater" label="更新人"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="create_time" label="创建时间"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="update_time" label="更新时间"></el-table-column>
                    <table-operator v-if="!this.form.active_id" :operateArray="operateArray2"></table-operator>
                    <table-operator v-else :operateArray="operateArray3"></table-operator>
                </el-table>
                <!-- 分页 -->
                <div class="block">
                    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
                    :page-sizes="[10, 50, 100, 300]"
                    :page-size="page_size" layout="total, sizes, prev, pager, next, jumper"
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

 
        <el-dialog title="用例参数配置" :visible.sync="dialogFormVisible">
                <el-tabs v-model="activeTab" closable
                                    size="mini"
                                    tab-position="top" @tab-remove="removeTestPoint"
                                    style="margin-bottom:10px;height: 300px;overflow: auto;background: #fff;padding: 0 10px"
                                    @tab-click="setCheckedKeys" v-if="editPointConfig.testPoint&&editPointConfig.testPoint.length">
                    <div v-for="(point_item,point_index) in editPointConfig.testPoint" :key="point_index">
                        <el-tab-pane :label="point_item" :key="point_item+'_'+point_index" :name="''+point_index"  size="mini">
                            <el-form :model="editPointConfig.para[point_index]" :ref="point_item+'_'+point_index"  size="mini" style="width:90%">
                                <div v-if="editPointConfig.para[point_index]['form'].length==0" style="text-align:center;color:#666666">暂无数据</div>
                                <el-form-item v-for="(item,index) in editPointConfig.para[point_index]['form']" :label="item.key" label-width="150px"
                                                :key="item.key+'_'+point_index"
                                                :rules="{required: item.require,message: '此项不能为空',trigger: 'change'}">
                                    <div v-if="item.type === 'file'">
                                        <el-col>
                                            <div contenteditable="true" class="tag-input-wrapper" v-if="item['value']&&item['value']!==''" @click="focusOnFileInput(point_index,index,item.key)" >
                                                <el-tag
                                                        v-for="(tag,tag_index) in item['value'].split(',')"
                                                        :key="tag_index"
                                                        closable
                                                        :disable-transitions="false"
                                                        size="small"
                                                        @close="handleConfigClose(index,point_index,tag)"> {{tag}}
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
                                        :placeholder="item.default"
                                        clearable >
                                        <el-option v-for="op in item.options" :value="op" :label="''+op" :key="op"></el-option>
                                    </el-select>
                                    <el-select
                                            style="width:100%"
                                            v-else-if="item.type === 'multi_select'"
                                            multiple v-model="item['value']"
                                            :title="item.description"
                                            :placeholder="item.default"
                                            clearable >
                                        <el-option v-for="multiop in item.options" :value="multiop" :label="''+multiop" :key="multiop"></el-option>
                                    </el-select>

                                    <el-input
                                            v-else
                                            v-model="item['value']"
                                            auto-complete="off"
                                            :title="item.description"
                                            :placeholder="item.default" size="small"></el-input>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                    </div>
                </el-tabs>
                <div v-else style="text-align: center;color:#666666">暂无数据</div>
            <br/>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmRunSuite">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import TableOperator from "../../components/TableOperator/index";
    import { getProjectList } from '@/api/project';
    import { getMaterialList } from '@/api/others';
    import { updateSuite, createNewSuite } from '@/api/precision';
    import { getPointList ,getSetup, getTestPoint,getCreateSuiteList} from '@/api/precision';
    import { getAllName, getConfigList, configEditGet, configListEditPost, getRemoveConfig, getAddConfig, configRestore } from '@/api/precision';
    import JsonEditor from '@/components/JsonEditor';
    import axios from 'axios'
    import Cookies from "js-cookie";
    const rootPath = process.env.BASE_API;
    import { mapGetters } from 'vuex'
    export default {
        name:'createPrecision',
        components: { JsonEditor,TableOperator},
        data () {
            return {
                routeDataCaseConfig:[],
                isCaseEdit:false,
                isEdit:false,
                dialogFormVisible:false,
                addTestPoint:[],
                setupList:[],
                taskList: [],
                flag:'',
                total:0,
                page:1,
                page_size:10,
                currentConfig:{},
                config_name:[],
                creator:[],
                updater:[],
                addForm:{
                    product:'',
                    config_name:'',
                    jsonContent:'',
                },
                tableList:[],
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
                jsonVisible:false,
                setCheckedList:{},
                isTask: true,
                activeTab: '0',
                projectList: [],
                testPointList: [],
                editPointConfig:{
                    testPoint: ['y'],
                    para: [{
                        form: [{
                            default: "",
                            description: "",
                            key: "",
                            require: true,
                            type: "",
                            value:'',
                        }]
                    }],
                },
                stepData: {
                    setup:[],
                    task_ids:[],
                    case:[],
                    product:'',
                    description:'',
                    name:'',
                    id: '',
                    testPoint: ['1'],
                    para: [{
                        form: [{
                            default: "",
                            description: "",
                            key: "",
                            require: true,
                            type: "text",
                            value:'',
                        }]
                    }],
                    mail: {to_mail:[],cc_mail:[]}
                },
                to_mail: '',
                cc_mail: '',
                // dbList: [],
                multipleSelection: [],
                jsonName:[],
                focusedInput: {},
                props: {
                    label: 'name',
                    isLeaf: 'leaf'
                },
                dialogVisible:false,
                // dbVisible: false,
                formLabelWidth: '110px',
                isAddJsonName:false,
                isUpload:true,
                currentPonit_index:'',
                currentIndex:'',
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
            };
        },
        computed: {
            ...mapGetters([
                'name'
            ])
        },
        methods: {
            savePerfManage(){
                // 校验
                if(this.validateFormRule(this.$refs.stepFormText)){
                    // 处理mail
                    this.stepData.mail.to_mail = (this.to_mail=== "") ? [] : this.to_mail.split(',');
                    this.stepData.mail.cc_mail = (this.cc_mail=== "") ? [] : this.cc_mail.split(',');
                    // 处理case v-model 绑定的是name 需要传入对应的配置
                    let tem = [];
                    this.stepData.case&&this.stepData.case.length&&this.stepData.case.map(item=>{
                        this.addTestPoint.map(it=>{
                            if(item == it.name){
                                tem.push(it)
                            }
                        })
                    })
/*                     //校验 config必填项
                    let isSNone = true;
                    tem&&tem.length&&(tem.map(item=>{
                        item.config&&item.config.length&&(item.config.map(it=>{
                            if(it.require){
                                if(!it.hasOwnProperty("value")){
                                    isSNone = false;
                                    this.$message.error(`测试用例:${item.name} config必填项不可为空!`)
                                }
                            }
                        }))
                    }))
                    if(!isSNone) return false */
                    // 处理setup v-model 绑定的是name 需要传入对应的配置
                    let newSetup = [];
                    this.stepData.setup&&this.stepData.setup.length&&this.stepData.setup.map(item=>{
                        this.setupList.map(it=>{
                            if(item == it.name){
                                newSetup.push(it)
                            }
                        })
                    })
                    
                    let task_ids_arr = [];
                    this.stepData.task_ids.map((taskIdValue,taskIdIndex)=>{
                        this.taskList.map((taskListValue,taskListIndex)=>{
                            if(taskIdValue == taskListValue.key){
                                task_ids_arr.push(taskIdValue);
                            }
                        })
                    })

                    let repeatKey = [];
                    let nullValue = [];
                    for(let i=0;i<this.stepData.para[0].form.length;i++){
                        for(let ii=i+1;ii<this.stepData.para[0].form.length;ii++){
                           if(this.stepData.para[0].form[i].key != ""){
                                if(this.stepData.para[0].form[i].key === this.stepData.para[0].form[ii].key){
                                    repeatKey.push(this.stepData.para[0].form[i].key);
                                }
                           }
                        }
                        if(this.stepData.para[0].form[i].key != "" && this.stepData.para[0].form[i].value == ""){
                            nullValue.push(this.stepData.para[0].form[i].key);
                        }
                    }
                    if(repeatKey.length > 0){
                        this.$nextTick(()=>{
                            this.$message({showClose: true,message: '公共参数Key不能重复！<br/>'+"重复参数为："+Array.from(new Set(repeatKey)).join(","),type: 'error',dangerouslyUseHTMLString:true});
                        })
                        return false;
                    }
                    if(nullValue.length > 0){
                        this.$nextTick(()=>{
                            this.$message({showClose: true,message: '公共参数Value不能为空！<br/>'+"为空的Key为："+Array.from(new Set(nullValue)).join(","),type: 'error',dangerouslyUseHTMLString:true});
                        })
                        return false;
                    }
                    // 处理key是否空
                    let obj = {};
                    let form =[];
                    this.stepData.para[0].form.map((item,index)=>{
                        if(item.key != ''){
                            form.push({description:item.description,key:item.key,require:item.require,type:item.type,value:item.value})
                        }
                    })
                    this.stepData.para[0].form = form;
                    obj = {
                        product:this.stepData.product,
                        name:this.stepData.name,
                        description:this.stepData.description,
                        config:this.stepData.para[0].form,
                        setup:newSetup,
                        suite:task_ids_arr,
                        case:tem,
                    }
                    if(this.isEdit){
                        obj['id'] = this.stepData.id;
                    }
                    createNewSuite({data:obj,mail:this.stepData.mail}).then(response=>{
                        if(response.data.code === 0){
                            this.$message.success("操作成功！");
                            this.gotoSuiteList();
                            this.resetForm();
                        }
                        else{
                            this.$message.error(response.data.msg)
                        }
                    })
                }
            },
            resetForm(){
                this.isCaseEdit = false;
                this.isEdit = false;
                this.stepData = {
                    setup:[],
                    task_ids:[],
                    description:'',
                    case:[],
                    product:'',
                    name:'',
                    scene: '',
                    testPoint: ['1'],
                    para: [{
                        form: [{
                            default: "",
                            description: "",
                            key: "",
                            require: true,
                            type: "text",
                            value:'',
                        }]
                    }],
                    mail: {to_mail:[],cc_mail:[]}
                }
                this.addTestPoint = [];
                this.taskList = [];
            },
            confirmRunSuite(){
                // 赋值
                this.isCaseEdit = false;
                this.dialogFormVisible = false;
                this.addTestPoint.map((item,index)=>{
                    if(item.name == this.editPointConfig.name){
                        this.addTestPoint[index].config = this.editPointConfig.para[0].form
                    }
                })
            },
            editCaseConfig(self){
                this.isCaseEdit = true;
                self.config&&self.config.length&&(self.config.map(item=>{
                    if(!item.hasOwnProperty('value')){
                        if(item.type == "multi_select"){
                            this.$set(item, "value", []);
                        }else{
                            this.$set(item, "value", "");
                        }
                    }
                }))
                this.dialogFormVisible = true;
                this.editPointConfig.para[0].form = self.config;
            },
            getSuiteList(){
                let self = this;
                self.taskList = [];
                let obj = {
                    product:this.stepData.product
                }
                if(this.isEdit){
                    obj['id'] = this.stepData.id
                }
                getCreateSuiteList(obj).then(function (response) {
                    if(response.data.code === 0){
                        response.data.suites&&response.data.suites.length&&response.data.suites.map((item,index)=>{
                            self.taskList.push({key: item, label: item})
                        })
                    }
                })
            },
            getTaskList(){
                let self = this;
                getTestPoint({
                    product:this.stepData.product
                }).then(function (response) {
                    if(response.data.code === 0){
                        self.addTestPoint = response.data.results;
                        self.routeDataCaseConfig&&self.routeDataCaseConfig.length&&(self.routeDataCaseConfig.map(item=>{
                            self.addTestPoint.map(it=>{
                                if(item.name == it.name){
                                     item.config.map((ii)=>{
                                        it.config.map((iii)=>{
                                            if(iii.key == ii.key){
                                                self.$set(iii, "value", ii.value)
                                            }
                                        })
                                    })
                                }
                            })
                        }))
                    }
                })
                this.getSuiteList();
            },
            addPointParam(){
                this.stepData.para[0].form.push({
                    description: "",
                    key: "",
                    require: true,
                    type: "text",
                    value: ""
                })
            },
            gameoverConfig(index){
                this.stepData.para[0].form.splice(index,1)
            },
            handleSizeChange(val) {
                this.page = 1;
                this.page_size = val;
                this.seachCondition();
            },
            handleCurrentChange(val) {//改变页码
                this.page = val;
                this.seachCondition();
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
                                this.seachCondition();
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
            chooseJsonName(val){
                this.jsonName = val;
            },
            viewConfig(item){
                this.isReadOnly=true;
                this.flag = 'view'
                this.isAddJsonName = true;
                this.configEdit(item);
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
            editConfig(item){
                this.isReadOnly=false;
                this.flag = 'edit';
                this.currentConfig = item;//保存当前item edit接口需要
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
            gotoAdd(){
                this.addForm = {
                    product:this.form.product,
                    config_name:'',
                    jsonContent:''
                };
                this.isAddJsonName = true;//新增json页面
                this.flag = 'add';
                this.isReadOnly = false;
            },
            seachCondition() {
                getConfigList({
                        product:this.form.product,
                        page:this.page,
                        page_size:this.page_size,
                        time:this.form.time == null?'':JSON.stringify(this.form.time),
                        cfg_name:this.form.config_name,
                        creator:this.form.creator,
                        updater:this.form.updater,
                        active:this.form.active
                    }).then(e=>{
                    if(e.data.code == 0){
                        this.tableList = e.data.results.result;
                        this.total = e.data.results.total;
                    }else{
                        this.tableList = [];
                        this.$message.error(e.data.msg)
                    }
                })
            },
            viewTask(){
                this.form.worker_id?this.form.creator = this.name:this.form.creator = '';
                this.seachCondition();
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
            choosedJson(){
                let temp = [];
                this.jsonName&&this.jsonName.length&&(this.jsonName.map(item=>{
                    temp.push(item.config_name)
                }))
                if(this.isCaseEdit){
                    this.editPointConfig.para[this.currentPonit_index].form[this.currentIndex].value = temp.join(',');
                }else{
                    this.stepData.para[this.currentPonit_index].form[this.currentIndex].value = temp.join(',');
                }
                this.jsonVisible = false;
            },
            setCheckedKeys() {
                if(this.$refs.tree) {
                    this.defaultExpand = false;
                    for (var i = 0; i < this.$refs.tree.store._getAllNodes().length; i++) {
                        this.$refs.tree.store._getAllNodes()[i].expanded = this.defaultExpand;
                    }
                }
            },
            handleClose(index,point_index,tag){
                let tmp = this.stepData.para[point_index]['form'][index]["value"].split(',')
                tmp.splice(tmp.indexOf(tag),1);
                this.stepData.para[point_index]['form'][index]["value"] = tmp.join(',')
            },
            handleConfigClose(index,point_index,tag){
                let tmp = this.editPointConfig.para[point_index]['form'][index]["value"].split(',')
                tmp.splice(tmp.indexOf(tag),1);
                this.editPointConfig.para[point_index]['form'][index]["value"] = tmp.join(',')
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getSetup(){
                if(this.stepData.product == '') return this.$message.error('请先填写项目!')
                getSetup({
                    product: this.stepData.product,
                }).then(response => {
                    this.setupList = response.data.results;
                })
            },
            removeTestPoint(tabName){
                let index = parseInt(tabName);
                let active = parseInt(this.activeTab);
                this.stepData.testPoint.splice(index,1);
                this.stepData.para.splice(index,1);
                if ((active > index) || (active === this.stepData.testPoint.length)) {
                    active -= 1;
                }
                if(active < 0){
                    active = 0;
                }
                this.activeTab = active.toString();
            },
            focusOnFileInput(point_index,index,key){
                this.dialogVisible = true;
                if(this.dialogFormVisible == false) this.isCaseEdit = false;
                for(let i in this.setCheckedList){
                    this.setCheckedList[i].map(it=>{
                        this.$nextTick(()=>{
                            this.$refs.tree.setChecked(it,false)
                        })
                    })
                }
                let tem = [];
                let temList = this.isCaseEdit?this.editPointConfig.para[point_index].form[index].value.split(','):this.stepData.para[point_index].form[index].value.split(',')
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
                            this.$nextTick(()=>{
                                this.$refs.tree.setChecked(it,true)
                            })
                        })
                        
                    }
                }
                this.focusedInput = {point_index: point_index, index: index};
            },
            choosedMaterial(){
                let self = this;
                let checkedNodeslist = self.$refs.tree.getCheckedNodes();
                let tmp = [];
                if(self.isCaseEdit){
                    if(self.editPointConfig.para[self.focusedInput.point_index]){
                        if(self.editPointConfig.para[self.focusedInput.point_index]['form'][self.focusedInput.index]["value"]!=='') {
                            tmp = self.editPointConfig.para[self.focusedInput.point_index]['form'][self.focusedInput.index]["value"].split(',')
                        }
                    }
                }else{
                    if(self.stepData.para[self.focusedInput.point_index]){
                        if(self.stepData.para[self.focusedInput.point_index]['form'][self.focusedInput.index]["value"]!=='') {
                            tmp = self.stepData.para[self.focusedInput.point_index]['form'][self.focusedInput.index]["value"].split(',')
                        }
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
                if(self.isCaseEdit){
                    self.editPointConfig.para[self.focusedInput.point_index]['form'][self.focusedInput.index]["value"] = tmp.join(',');
                }else{
                    self.stepData.para[self.focusedInput.point_index]['form'][self.focusedInput.index]["value"] = tmp.join(',');
                }
                self.dialogVisible = false;
                self.focusedInput = {};
            },
            focusOnProInput(point_index,index,item){
                if(this.dialogFormVisible == false) this.isCaseEdit = false;
                if(this.stepData.product == '') return this.$message.error('请先填写项目!')
                this.currentPonit_index = point_index;
                this.currentIndex = index;
                this.jsonVisible = true;
                this.isAddJsonName = false;
                this.form.product = this.stepData.product;
                this.getName();
                this.seachCondition();
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            gotoSuiteList(){
                this.$router.push({
                    path: 'precision/suiteList',
                    name: 'suiteList',
                })
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
            getParams(){
                this.getProject();
                let tem = this.$route.params.dataObj;
                if(tem){
                    this.isEdit = true;
                    this.stepData.name = tem.data.name;
                    this.stepData.id = tem.id;
                    this.stepData.product = tem.data.product;
                    this.stepData.description = tem.data.description;
                    this.to_mail = tem.mail.to_mail.join(",");
                    this.cc_mail = tem.mail.cc_mail.join(",");
                    // suite
                    tem.data.suite&&tem.data.suite.length&&(tem.data.suite.map(item=>{
                        this.stepData.task_ids.push(item)
                    }))
                    // setup
                    tem.data.setup&&tem.data.setup.length&&(tem.data.setup.map(item=>{
                        this.stepData.setup.push(item.name)
                    }))
                    this.getSetup();
                    // config
                    this.stepData.para[0].form = tem.data.config;
                    // case
                    this.routeDataCaseConfig = tem.data.case;
                    tem.data.case&&tem.data.case.length&&(tem.data.case.map(item=>{
                        this.stepData.case.push(item.name)
                    }))
                    this.getTaskList();
                }
            },
            handRightChange(value, direction, movedKeys){
                if(direction==='left'){
                    this.addTestPoint.map((vv,ii,aa)=>{
                        movedKeys.map((keysValue,keysIndex,keysArrary)=>{
                            if(vv.name == keysValue){
                                this.addTestPoint[ii].config.map((configValue,configIndex,configArrary)=>{
                                    this.$set(configValue, "value", "");
                                }) 
                            }
                        })
                    })

                }
            },
        },
        mounted () {
            this.getParams();
        },
        beforeDestroy () {
            this.$store.dispatch('app/toggleParentNav');
        }
    };
</script>

<style scoped>
.backgroundColorInput{
    width: 300px;
}
    .block {
        float: right;
        margin-top: 15px;
    }
    ._right {
        display: block;
        float: right;
    }

    .float_lef {
        float: left;
    }

    ._table {
        height: 650px;
        overflow: auto;
        margin-top: 20px;
    }

    ._table2 {
        height: 450px;
        overflow: auto;
        margin-top: 0;
    }
    .margin_bottom{
        margin-bottom:20px;
    }
    .block {
        float: right;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 5px;
    }

    .tag-input-wrapper{
        margin-left: 5px;
        max-height:150px;
        min-height:35px;
        overflow-y: auto;
        border: 1px solid #dcdfe6;
        border-radius:5px
    }
    .el-button--mini.is-circle {
        padding: 7px;
    }

    ._caseJson .json-editor >>> .CodeMirror {
        max-height: 100%;
        min-height: 400px;
        font-size: 16px;
    }
    ._caseJson .json-editor >>> .CodeMirror-scroll{
        min-height: 400px;
    }
</style>
<style>
    #createPrecision .el-dialog__footer {
        padding: 40px 20px 20px;
    }
    #createPrecision .el-transfer-panel {
        width: 400px;
    }
    #createPrecision .el-checkbox:last-of-type {
        margin-right: 30px;
    }
    .el-transfer-panel__body{
        height: 270px;
    }
    .el-transfer-panel__list{
        height: 220px !important;
    }
    .hr_status{
        width: 1px;
        height: 718px;
        border: none;
        background-color: #E6E6E6;
    }
    @media only screen and (max-width: 1900px) {
        .hr_status{
            height: 0px;
        }
        .col_left{
            float: left;
            width: 50%;
        }
    }
</style>

