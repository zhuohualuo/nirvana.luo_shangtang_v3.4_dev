<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="addCaseType" icon="el-icon-plus">新 增</el-button>
            </div>
        </el-row>

        <el-row>
            <el-table :data="pageList.programData"
                      height="720" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column show-overflow-tooltip prop="id" label="id"></el-table-column>-->
                <el-table-column type="index" width="90" label="序号"></el-table-column>
                <el-table-column show-overflow-tooltip prop="type_name" label="类型名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="description" label="描述"></el-table-column>
                <el-table-column show-overflow-tooltip prop="creator" label="创建人"></el-table-column>
                <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" :formatter="dateFormat"></el-table-column>
                <!--<el-table-column prop="operation" label="操作">-->
                    <!--<template slot-scope='props'>-->
                        <!--<el-row>-->
                            <!--<el-col :span='8'>-->
                            <!--<el-button size='small' type='text' @click='updateSelf1(props.row)'>编辑</el-button>-->
                            <!--</el-col>-->
                            <!--<el-col :span='8'>-->
                                <!--<el-button size='small' type='danger' @click='deleteSelf1(props.row)'>删 除</el-button>-->
                            <!--</el-col>-->
                        <!--</el-row>-->
                    <!--</template>-->
                <!--</el-table-column>-->
            </el-table>
        </el-row>

        <!--<div class="block">-->
            <!--<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"-->
                           <!--:page-sizes="[10, 15, 20, 50, 100]"-->
                           <!--:page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"-->
                           <!--:total="pageList.count">-->
            <!--</el-pagination>-->
        <!--</div>-->

        <el-dialog title="新增用例类型" :visible.sync="dialogFormVisible" width="35%">
            <el-form :model="form" :rules="formRule" ref="form">
                <el-form-item label="类型名称" :label-width="formLabelWidth" prop="type_name">
                    <el-input v-model.trim="form.type_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="描述" :label-width="formLabelWidth" prop="description">
                    <el-input v-model.trim="form.description" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveCaseType">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import { getCaseTypeList, createNewType, deleteCaseType } from '@/api/case';
    import moment from 'moment' //引入moment化简时间

    export default {
        name: 'caseType',
        data() {
            return {
                form: {
                    id: '',
                    type_name: '',
                    description: ''
                },
                formLabelWidth: '80px',
                pageNums: 10,//每页几条
                pageNum: 1, //当前是第几页
                dialogFormVisible: false,
                pageList: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                formRule: {
                    type_name: [
                        { required: true, message: '请输入名称', trigger: 'blur' },
                        { max: 16, message: '类型名称不能超过16个字符', trigger: 'blur' },
                    ],
                    description: [
                        { required: true, message: '请输入描述', trigger: 'blur' },
                        { max: 255, message: '描述不能超过255个字符', trigger: 'blur' },
                    ]
                }
            }
        },

        computed: {
        },

        mounted() {
            this.getListByPage();
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
                getCaseTypeList().then(function (response) {
                    self.pageList = {
                        page_no: self.pageNum,
                        page_size: 10 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.types
                    }
                })
            },
            updateSelf1(self) {
                this.form.type_name = self.type_name;
                this.form.description = self.description;
                this.dialogFormVisible = true;
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteCaseType({case_type_ids: self.id}).then(function (response) {
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
            addCaseType(){
                this.dialogFormVisible = true;
                this.resetForm();
            },
            saveCaseType() {
                let ref = this;
                if (!ref.validateFormRule('form')) {
                    return false;
                }
                createNewType({
                    type_name: ref.form.type_name.replace(/^\s*/, '').replace(/\s*$/, ''),
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
            resetForm()
            {
                if(this.$refs["form"] != undefined){
                    this.$refs["form"].resetFields();
                }
            },
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            seachCondition() {
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
