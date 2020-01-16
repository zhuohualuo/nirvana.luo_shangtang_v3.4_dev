<template>
    <div id="content">
        <el-row>
            <el-form :inline="true" class="_bottom0 demo-form-inline">
                <el-form-item label="名称">
                    <el-input v-model="form2.title"></el-input>
                </el-form-item>
                <el-form-item label="机器类型">
                    <el-select v-model="form2.m_type" clearable>
                        <el-option label="服务程序" :value="1"></el-option>
                        <el-option label="数据库" :value="2"></el-option>
                        <el-option label="web测试客户机" :value="3"></el-option>
                        <el-option label="app测试客户机" :value="4"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="seachCondition" icon="el-icon-search"></el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="addMachine">新 增</el-button>
                </el-form-item>
            </el-form>
        </el-row>

        <el-row>
            <el-table :data="List.programData"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column show-overflow-tooltip prop="id" label="id"></el-table-column>-->
                <el-table-column show-overflow-tooltip prop="title" label="机器名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="ip" label="IP"></el-table-column>
                <el-table-column show-overflow-tooltip prop="m_type_name" label="机器类型"></el-table-column>
                <el-table-column show-overflow-tooltip prop="status" label="状态" :formatter="statusFormat" width="90"></el-table-column>
                <el-table-column show-overflow-tooltip prop="update_user" label="操作人"></el-table-column>
                <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" :formatter="dateFormat" width="170"></el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" :formatter="dateFormat" width="170"></el-table-column>
                <el-table-column prop="operation" label="操作" width="300">
                    <template slot-scope='props'>
                        <el-row>
                            <el-col :span='6'>
                                <el-button size='small' @click='viewDetail(props.row)'>查 看</el-button>
                            </el-col>
                            <el-col :span='6'>
                                <el-button size='small' type='primary' @click='updateSelf1(props.row)'>编 辑</el-button>
                            </el-col>
                            <el-col :span='6'>
                                <el-button size='small' type='danger' @click='deleteSelf1(props.row)'>删 除</el-button>
                            </el-col>
                            <el-col :span='6' v-if="(props.row.m_type===3)||(props.row.m_type===4) ">
                                <el-button size='small' type='warning' plain @click='disableSelf(props.row)' v-if="props.row.status!==0">禁 用</el-button>
                                <el-button size='small' type='warning' @click='enableSelf(props.row)' v-if="props.row.status===0">启 用</el-button>
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

        <el-dialog title="机器配置" :visible.sync="dialogFormVisible">
            <el-form :model="form" style="width: 90%" ref="form" :rules="formRule">
                <el-row>
                    <el-form-item label="名称" :label-width="formLabelWidth" prop="title">
                        <el-input v-model="form.title" :disabled="isDisable"></el-input>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="IP" :label-width="formLabelWidth" prop="ip">
                            <el-input v-model="form.ip" :disabled="isDisable"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="端口" :label-width="formLabelWidth" prop="port">
                            <el-input v-model="form.port" :disabled="isDisable"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="URL" :label-width="formLabelWidth" prop="url">
                            <el-input v-model="form.url" :disabled="isDisable"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <hr class="_divide"/>
                <el-row>
                    <el-form-item label="机器类型" :label-width="formLabelWidth" prop="m_type">
                        <el-select v-model="form.m_type" :disabled="isDisable" style="width: 50%">
                            <el-option label="服务程序" :value="1"></el-option>
                            <el-option label="数据库" :value="2"></el-option>
                            <el-option label="web测试客户机" :value="3"></el-option>
                            <el-option label="app测试客户机" :value="4"></el-option>
                        </el-select>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="机器用户名" :label-width="formLabelWidth1" prop="m_user">
                            <el-input v-model="form.m_user" :disabled="isDisable"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="机器密码" :label-width="formLabelWidth1" prop="m_pw">
                            <el-input v-model="form.m_pw" :disabled="isDisable"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <div v-if="form.m_type===2">
                    <hr class="_divide"/>
                    <el-row>
                        <el-form-item label="数据库类型" :label-width="formLabelWidth" prop="db_type">
                            <el-select v-model="form.db_type" :disabled="isDisable" style="width: 50%">
                                <el-option label="MySQL" :value="1"></el-option>
                                <el-option label="Oracle" :value="2"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                            <el-form-item label="数据库连接URI" :label-width="formLabelWidth1" prop="db_uri">
                                <el-input v-model="form.db_uri" :disabled="isDisable"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="数据库用户名" :label-width="formLabelWidth1" prop="db_user">
                                <el-input v-model="form.db_user" :disabled="isDisable"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="数据库密码" :label-width="formLabelWidth1" prop="db_pw">
                                <el-input v-model="form.db_pw" :disabled="isDisable"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <div v-if="isDisable">
                    <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
                </div>
                <div v-else>
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveMachine">确 定</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { getMachineList, createNewMachine, updateMachine, deleteMachine } from '@/api/webUI';
    import moment from 'moment'; //引入moment格式化时间

    export default {
        name: "machineList",
        data() {
            return {
                form2: {
                    title: '',
                    m_type: '',
                },
                form: {
                    id: 0,
                    title: '',
                    url: '',
                    ip: '',
                    port: '',
                    status: 1,
                    m_type: '',
                    m_user: '',
                    m_pw: '',
                    db_type: 0,
                    db_uri: '',
                    db_user: '',
                    db_pw: ''
                },
                pageNums: 10,//每页几条
                pageNum: 1, //当前是第几页
                formLabelWidth: '90px',
                formLabelWidth1: '120px',
                dialogFormVisible: false,
                List: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                formRule:{
                    title: [
                        { required: true, message: '请填写机器名称', trigger: 'blur' },
                    ],
                    url: [
                        { required: true, message: '请填写URL', trigger: 'blur' },
                    ],
                    ip: [
                        { required: true, message: '请填写IP', trigger: 'blur' },
                    ],
                    port: [
                        { required: true, message: '请填写端口', trigger: 'blur' },
                    ],
                    m_type: [
                        { required: true, message: '请选择机器类型', trigger: 'change' },
                    ]
                },
                isDisable: false
            }
        },
        computed: {
        },
        mounted() {
            this.initList({'page_no': 1, 'page_size': 10});
        },
        methods: {
            handleSizeChange(val) {
                this.pageNums = val;
                this.initList({
                    'page_no': this.pageNum,
                    'page_size': val,
                    'title': this.form2.title,
                    'm_type': this.form2.m_type,
                });
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.initList({
                    'page_no': val,
                    'page_size': this.pageNums,
                    'title': this.form2.title,
                    'm_type': this.form2.m_type,
                });
            },
            initList(params){
                let self = this;
                getMachineList(params).then(function (response) {
                    console.log(response)
                    self.List = {
                        page_no: params.page_no,
                        page_size: 10 || params.page_size,
                        count: response.data.total,
                        programData: response.data.content
                    }
                }).catch(function (err) {
                });
            },
            seachCondition() {
                this.initList({
                    page_no: 1,
                    page_size: 10,
                    title: this.form2.name,
                    m_type: this.form2.m_type
                })
            },
            viewDetail(self){
                this.resetForm();
                this.isDisable = true;
                this.form = self;
                this.dialogFormVisible = true;
            },
            deleteSelf1(self) {
                let ref=this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteMachine({id: self.id}).then(function (response) {
                        console.log(response.data);
                        if (response.data.code === 0) {
                            ref.open2();
                            ref.initList({'page_no': 1, 'page_size': 10});
                        }
                        else {
                            ref.open3(response.data.msg);
                        }
                    }).catch(function (err) {
                    })
                }).catch(() => {
                })
            },
            updateSelf1(self) {
                this.resetForm();
                this.form = self;
                this.dialogFormVisible = true;
            },
            disableSelf(self) {
                let ref = this;
                let tmp = Object.assign({},self);
                tmp.status = 0;
                updateMachine(tmp).then((response)=>{
                    if(response.data.code === 0){
                        self.status = 0;
                    }
                    else{
                        ref.open3(response.data.msg)
                    }
                })
            },
            enableSelf(self) {
                let ref = this;
                let tmp = Object.assign({},self);
                tmp.status = 1;
                updateMachine(tmp).then((response)=>{
                    if(response.data.code === 0){
                        self.status = 1;
                    }
                    else{
                        ref.open3(response.data.msg)
                    }
                })
            },
            addMachine(){
                this.resetForm();
                this.dialogFormVisible = true;
            },
            saveMachine(){
                if (this.validateFormRule("form")){
                    if(this.form.id > 0){
                        let self = this;
                        updateMachine(this.form).then((response)=>{
                            if(response.data.code === 0){
                                self.open1();
                            }
                            else{
                                self.open3(response.data.msg)
                            }
                        })
                    }
                    else{
                        createNewMachine(this.form).then((response)=>{
                            if(response.data.code === 0){
                                self.open1();
                            }
                            else{
                                self.open3(response.data.msg)
                            }
                        })
                    }
                }
                else{
                    return false;
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
            statusFormat(row, column){
                let status = row[column.property];
                switch(status){
                    case 0:
                        return "禁用";
                    case 1:
                        return "空闲";
                    case 2:
                        return "使用中";
                    default:
                        return "";
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
            getIdFromList(list){
                let tmp = [];
                list.forEach(function(item){
                    tmp.push(item.id)
                })
                return tmp;
            },
            resetForm()
            {
                if(this.$refs["form"] != undefined){
                    this.$refs["form"].resetFields();
                    this.form = {
                        id: 0,
                        title: '',
                        url: '',
                        ip: '',
                        port: '',
                        status: 1,
                        m_type: '',
                        m_user: '',
                        m_pw: '',
                        db_type: 0,
                        db_uri: '',
                        db_user: '',
                        db_pw: ''
                    }
                }
                this.isDisable = false;
            },
            open1() {
                this.$message({
                    showClose: true,
                    message: '保存成功！',
                    type: 'success'
                });
            },
            open2() {
                this.$message({
                    showClose: true,
                    message: '删除成功！',
                    type: 'success'
                });
            },
            open3(msg) {
                this.$message({
                    showClose: true,
                    message: msg,
                    type: 'fail'
                });
            }
        }
    }
</script>

<style scoped>
    .el-input.is-disabled .el-input__inner {
        color: #606266;
        border: none;
        width: 100%;
    }

    .block {
        float: right;
        margin-top: 15px;
    }

    ._divide {
        height: 1px;
        border: none;
        background-color: #E6E6E6;
        margin-bottom: 20px;
    }
</style>