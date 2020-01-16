<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="addModule" icon="el-icon-plus">新 增</el-button>
            </div>
            <advance-filter :formData="form2" :filterArray="filterArray" @search="seachCondition"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="pageList.programData"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column show-overflow-tooltip prop="id" label="id"></el-table-column>-->
                <el-table-column type="index" label="序号" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="module" label="模块"></el-table-column>
                <el-table-column show-overflow-tooltip prop="project" label="项目"></el-table-column>
                <el-table-column show-overflow-tooltip prop="version" label="版本"></el-table-column>
                <el-table-column show-overflow-tooltip prop="description" label="描述"></el-table-column>
                <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" :formatter="dateFormat"></el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" :formatter="dateFormat"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="pageList.count">
            </el-pagination>
        </div>

        <el-dialog :title="isEdit?'编辑模块':'新增模块'" :visible.sync="dialogFormVisible" width="35%">
            <el-form :model="form" :rules="formRule" ref="form">
                <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                    <el-select v-model="form.project_id"
                               @change="(val)=>{form.version_id=[];getVersion(val)}"
                               auto-complete="off" style="width: 100%">
                        <el-option
                                v-for="(item,index) in projectList"
                                :label="item.name"
                                :value="item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="版本" :label-width="formLabelWidth" prop="version_id">
                    <el-select v-model="form.version_id"
                               :disabled="form.project_id==''"
                               multiple auto-complete="off" style="width: 100%">
                        <el-option
                                v-for="(item,index) in versionList"
                                :label="item.version"
                                :value="''+item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="模块" :label-width="formLabelWidth" prop="module">
                    <el-input v-model.trim="form.module" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="描述" :label-width="formLabelWidth" prop="description">
                    <el-input v-model.trim="form.description" type="textarea" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveModuleManage">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import AdvanceFilter from "../../components/AdvanceFilter/index";
    import TableOperator from "../../components/TableOperator/index";
    import { FilterProject, FilterVersion } from '@/common/index';
    import { getProjectList, getVersionList } from '@/api/project';
    import { getModuleList, createModule, updateModule, deleteModule } from '@/api/project';
    import moment from 'moment' //引入moment化简时间

    export default {
        name: 'moduleList',
        components: {AdvanceFilter, TableOperator},
        data() {
            return {
                operateArray: [
                    {label:'编辑', click:this.updateSelf1},
                    {label:'删除', type:"danger", click:this.deleteSelf1}
                ],
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject,
                        change:()=>{this.form2.version_id=''}},
                    {key:'version_id',name:'版本',type:'select',optionList:[],visible: this.getFilterVersion,
                        disable:()=>{return this.form2.project_id===''}},
                ],
                form: {
                    id: '',
                    project_id: '',
                    version_id: [],
                    module: '',
                    description: ''
                },
                form2: {
                    project_id: '',
                    version_id: ''
                },
                projectList: [],
                versionList: [],
                versionList1: [],
                formLabelWidth: '70px',
                pageNums: 20,//每页几条
                pageNum: 1, //当前是第几页
                dialogFormVisible: false,
                pageList: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                formRule: {
                    project_id: [
                        { required: true, message: '请选择项目', trigger: 'change' },
                    ],
                    version_id: [
                        { required: true, message: '请选择版本', trigger: 'change' },
                    ],
                    module: [
                        { required: true, message: '请输入模块', trigger: 'blur' },
                        { max: 16, message: '模块名称不能超过16个字符', trigger: 'blur' },
                    ],
                    description: [
                        { max: 255, message: '描述不能超过255个字符', trigger: 'blur' }
                    ]
                },
                isEdit:false
            }
        },

        computed: {
        },

        mounted() {
            this.getListByPage();
            this.getProject();
        },

        methods: {
            handleSizeChange(val) {
                this.pageNum = 1;
                this.pageNums = val;
                this.getListByPage();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.getListByPage();
            },
            getListByPage() {
                let self = this;
                getModuleList({
                    page_no: self.pageNum,
                    page_size: self.pageNums,
                    project_id: self.form2.project_id,
                    version_id: self.form2.version_id
                }).then(function (response) {
                    console.log(response)
                    self.pageList = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.object
                    }
                })
            },
            updateSelf1(self) {
                this.resetForm();
                this.isEdit = true
                this.form.id = self.id;
                this.form.project_id = self.project_id;
                this.form.version_id = self.version_id.split(',');
                this.form.module = self.module;
                this.form.description = self.description;
                this.getVersion(self.project_id, 'form');
                this.dialogFormVisible = true;
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteModule(self.id).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！");
                            ref.getListByPage();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
                    .catch(function (err) {
                    });
                }).catch(() => {})
            },
            saveModuleManage() {
                let ref = this;
                if (!ref.validateFormRule('form')) {
                    return false;
                }
                if(ref.form.id > 0){
                    updateModule(ref.form.id, {
                        id: ref.form.id,
                        project_id: ref.form.project_id,
                        version_id: ref.form.version_id.join(','),
                        module: ref.form.module,
                        description: ref.form.description
                    }).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("保存成功！");
                            ref.dialogFormVisible = false;
                            ref.getListByPage();
                            ref.resetForm();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
                }
                else{
                    createModule({
                        id: ref.form.id,
                        project_id: ref.form.project_id,
                        version_id: ref.form.version_id.join(','),
                        module: ref.form.module,
                        description: ref.form.description
                    }).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("保存成功！");
                            ref.dialogFormVisible = false;
                            ref.getListByPage();
                            ref.resetForm();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
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
            addModule(){
                this.isEdit = false
                this.dialogFormVisible = true;
                this.resetForm();
            },
            resetForm()
            {
                if(this.$refs["form"] != undefined){
                    this.$refs["form"].resetFields();
                    this.form = {
                        id: '',
                        project_id: '',
                        version_id: [],
                        module: '',
                        description: ''
                    }
                }
            },
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            getProject()
            {
                let self = this;
                getProjectList().then(function (response) {
                    // console.log(response)
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getVersion(val){
                let self = this;
                getVersionList({project_id: val}).then(function (response) {
                    // console.log(response)
                    self.versionList = response.data.version;
                }).catch(function (err) {
                });
            },
            getFilterProject(item){
                FilterProject(item)
            },
            getFilterVersion(item){
                FilterVersion(item, this.form2)
            },
            seachCondition(val) {
                this.form2 = val;
                this.pageNum = 1;
                this.getListByPage();
            },
        }
    }
</script>
<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }
</style>
