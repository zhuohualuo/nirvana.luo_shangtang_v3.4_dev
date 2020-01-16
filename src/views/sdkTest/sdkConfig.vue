<template>
    <div id="content">
        <el-row>
            <el-form :inline="true" class="_bottom0 demo-form-inline">
                <el-form-item label="标题">
                    <el-input v-model="filter.title" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="filter.status" clearable>
                        <el-option :value="0" label="禁用"></el-option>
                        <el-option :value="1" label="启用"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="seachCondition" icon="el-icon-search"></el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="addSdkConfig">新 增</el-button>
                </el-form-item>
            </el-form>
        </el-row>

        <el-row>
            <el-table :data="List.programData" ref="table"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <el-table-column show-overflow-tooltip prop="id" label="ID" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="配置标题"></el-table-column>
                <el-table-column show-overflow-tooltip prop="content" label="配置内容"></el-table-column>
                <el-table-column show-overflow-tooltip prop="status" label="状态" :formatter="statusFormat"></el-table-column>
                <el-table-column show-overflow-tooltip prop="owner" label="创建人"></el-table-column>
                <el-table-column prop="operation" label="操作" width="200">
                    <template slot-scope='props'>
                        <el-row>
                            <el-col :span='8'>
                                <el-button size='small' type='danger' @click='deleteSelf1(props.row)'>删 除</el-button>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[10, 15, 20, 50, 100]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="List.count">
            </el-pagination>
        </div>

        <el-dialog title="新增配置" :visible.sync="dialogFormVisible">
            <el-form :model="form" ref="form" :rules="ruleValidate" style="width: 90%">
                <el-form-item label="配置标题" :label-width="formLabelWidth" prop="title" >
                    <el-input v-model.trim="form.title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="配置内容" :label-width="formLabelWidth" prop="content">
                    <el-input v-model="form.content" type="textarea" :autosize="{ minRows: 2, maxRows: 16 }"></el-input>
                </el-form-item>
                <el-form-item label="状态" :label-width="formLabelWidth" prop="status">
                    <el-select v-model="form.status">
                        <el-option :value="0" label="禁用"></el-option>
                        <el-option :value="1" label="启用"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitSdkConfig">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { getSdkConfigList, createSdkConfig, deleteSdkConfig } from '@/api/sdkTest';
    import { openFile } from '@/api/others';
    import moment from 'moment'; //引入moment格式化时间

    export default {
        name: "sdkConfig",
        data() {
            var JSONFormat = (rule, value, callback) => {
                if(value !== "")
                {
                    var obj;
                    try {
                        //data有可能不是合法的JSON字符串，便会产生异常
                        obj = JSON.parse(value);
                        this.form.content = JSON.stringify(obj, null, 4);
                        callback();
                    } catch (e) {
                        callback(new Error('不合法的JSON格式'));
                    }
                }
            };
            return {
                form: {
                    status: 1,
                    title: "",
                    content: ""
                },
                filter: {
                    status: '',
                    title: ''
                },
                pageNums: 10,//每页几条
                pageNum: 1, //当前是第几页
                formLabelWidth: '80px',
                dialogFormVisible: false,
                List: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                projectList: [],
                versionList: [],
                moduleList: [],
                ruleValidate:{
                    title: [
                        { required: true, message: '配置标题不能为空', trigger: 'blur' }
                    ],
                    content: [
                        { required: true, message: '配置内容不能为空', trigger: 'blur' },
                        { validator: JSONFormat, trigger: 'blur' }
                    ]
                }
            }
        },
        computed: {
        },
        mounted() {
            console.log("$route.filter",this.$route.params.filter)
            if((this.$route.params.filter !== null) && (this.$route.params.filter !== undefined)){
                this.filter = this.$route.params.filter;
            }
            this.initList();
        },
        methods: {
            handleSizeChange(val) {
                this.pageNums = val;
                this.pageNum = 1;
                this.initList();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.initList();
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                let self = this;
                if(flag == true){
                    getVersionList({project_id: self.form.project_id}).then(function (response) {
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
                        project_id: self.form.project_id,
                        version_id: self.form.version_id
                    }).then(function (response) {
                        console.log(response)
                        self.moduleList = response.data.module;
                    }).catch(function (err) {
                    });
                }
            },
            initList(){
                let self = this;
                getSdkConfigList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    status: this.filter.status,
                    title: this.filter.title,
                }).then(function (response) {
                    console.log(response)
                    self.List = {
                        page_no: self.pageNum,
                        page_size: 10 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.data
                    }
                }).catch(function (err) {
                });
            },
            seachCondition() {
                this.pageNum = 1;
                this.initList();
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteSdkConfig({id: self.id}).then(function (response) {
                        console.log(response.data);
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！");
                            ref.initList();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (err) {
                    })
                }).catch(() => {})
            },
            addSdkConfig(){
                this.resetForm();
                this.dialogFormVisible = true;
            },
            submitSdkConfig(){
                let ref = this;
                if (ref.validateFormRule('form')) {
                    createSdkConfig(ref.form).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("新增成功！");
                            ref.dialogFormVisible = false;
                            ref.resetForm();
                            ref.initList();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
                }
            },
            statusFormat(row, column){
                let type = row[column.property];
                if (type === undefined || type === null) {
                    return "";
                }
                switch(type){
                    case 0:
                        return "禁用";
                    case 1:
                        return "启用";
                    default:
                        return '';
                }
            },
            //时间格式化
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
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
            getIdFromList(list){
                let tmp = [];
                list.forEach(function(item){
                    tmp.push(item.id)
                })
                return tmp;
            },
            resetForm(){
                if(this.$refs["form"] != undefined){
                    this.$refs["form"].resetFields();
                    this.form = {
                        status: 1,
                        title: "",
                        content: ""
                    }
                }
            }
        }
    }
</script>

<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }
</style>