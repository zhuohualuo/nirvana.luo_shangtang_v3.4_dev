<template>
    <div id="content">
        <el-row>
            <el-button type="primary" size='small' @click="gotoSave">保存用例</el-button>
        </el-row>
        <el-row>
            <el-table
                    ref="multipleTable"
                    :data="caseList.programData"
                    height="680" border class='_table' header-cell-class-name="_table-head"
                    @selection-change="handleSelectionChange">
                <el-table-column type="selection"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="用例标题"></el-table-column>
                <el-table-column show-overflow-tooltip prop="projectVersion" label="项目版本" width="200">
                    <template slot-scope="scope">
                        <span>{{projectVersion}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="type" label="用例类型" width="90" :formatter="formatterType"></el-table-column>
                <el-table-column show-overflow-tooltip prop="content" label="用例内容"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo"
                           :page-sizes="[50, 100, 200, 500, 1000]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="caseList.count">
            </el-pagination>
        </div>

        <el-dialog title="编辑用例" :visible.sync="dialogFormVisible" @closed="closeEdit">
            <el-form :model="form" :rules="ruleValidate" ref="formValidate" style="width: 85%">
                <el-form-item label="用例名称" :label-width="formLabelWidth" prop="title">
                    <el-input v-model="form.title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="用例内容" :label-width="formLabelWidth" prop="content">
                    <el-input type="textarea" v-model="form.content" :autosize="{ minRows: 8, maxRows: 16}"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRowData('formValidate')">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>
<script>
    import TableOperator from "../../components/TableOperator/index";
    import { saveTemplateCase, getCaseTypeList } from '@/api/case';
    import moment from 'moment' //引入moment格式化时间

    export default {
        name:'templateCaseList',
        data() {
            return {
                projectList: [],
                versionList: [],
                projectVersion: '',
                caseList: {
                    pageNo: 1,
                    pageSize: 50,
                    count: 0,
                    programData: []
                },
                templateId: '',
                cacheList: [],
                formLabelWidth: '100px',
                pageNums: 50,//每页几条
                pageNo: 1,//当前是第几页,
                proName: '',
                form: {
                    content: '',
                    title: '',
                    type: '',
                    version_id: '',
                },
                dialogFormVisible: false,
                rowObj: {},
                multipleSelection: [],
                caseTypeList: [],
                ruleValidate: {
                    title: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
                    content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
                },
                operateArray:[
                    {label:'编辑', type:"primary", click:this.updateSelf1},
                ],
            }
        },

        computed: {},

        mounted() {
            this.getParams();
            this.getCaseType();
        },
        components: {
            TableOperator
        },
        beforeDestroy () {
            this.$store.dispatch("app/toggleParentNav");
        },
        methods: {
            getParams() {
                // 取到路由带过来的参数
                console.log("this.$route.params.dataObj:",this.$route.params.dataObj)
                var response = this.$route.params.dataObj;
                this.templateId = response.data.template_id;
                this.caseList.count = response.data.total;
                this.caseList.programData = response.data.cases;
                this.projectVersion = response.projectVersion;
                this.cacheList = this.caseList.programData;
            },
            getCaseType(){
                let self = this;
                getCaseTypeList().then(function (response){
                    console.log(response)
                    self.caseTypeList = response.data.types;
                }).catch(function (err) {
                });
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            updateSelf1(self) {
                this.form.title = self.title;
                this.form.content = self.content;
                this.dialogFormVisible = true;
                this.rowObj = self;
            },
            closeEdit(){
                this.form = {
                    content: '',
                    title: '',
                    type: '',
                    version_id: '',
                }
                this.$nextTick(()=>{
                    this.$refs['formValidate'].clearValidate();
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
            editRowData(name) {
                if(this.validateFormRule(name)){
                    this.rowObj.title = this.form.title;
                    this.rowObj.content = this.form.content;
                    this.dialogFormVisible = false;
                }
            },
            //时间格式化
            dateFormat(row, column) {
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            //用例类型格式化
            formatterType(row, column) {
                let type = row[column.property];
                let tmp = this.caseTypeList.filter((item)=>{
                    return item.id === type;
                })
                if(tmp.length > 0){
                    return tmp[0].type_name;
                }
                else{
                    return "";
                }
            },
            gotoSave(){
                let ref = this;
                if(ref.multipleSelection.length > 0) {
                    saveTemplateCase({
                        cases: ref.multipleSelection,
                        templateId: ref.templateId
                    }).then(function (response) {
                        console.log(response);
                        if(response.data.fail == ""){
                            ref.$message.success('保存成功!');
                        }
                        else{
                            ref.$message.error('以下用例保存失败：' + response.data.fail);
                        }
                        ref.caseList.programData = ref.filterCaseByTitle(response.data.success.split(","));
                        ref.caseList.count = ref.caseList.programData.length;
                        ref.cacheList = ref.caseList.programData;
                    }).catch(function (error) {
                        console.log(error);
                        ref.$message.error('保存失败!');
                    });
                }else{
                    this.$message({
                        showClose: true,
                        message: '请先勾选要保存的用例！',
                        type: 'fail'
                    });
                }
            },
            gotoList(){
                this.$router.push({
                    path: 'caseManage/templateList',
                    name: 'templateList',
                })
            },
            handleSizeChange(val) {//改变每页显示数
                this.pageNums = val;
            },
            handleCurrentChange(val) {//改变页码
                this.pageNo = val;
            },
            filterCaseByTitle(filterList){
                let arr = this.cacheList.filter(function(item) {
                    if(-1 === filterList.indexOf(item.title))
                    {
                        return true;
                    }
                })
                return arr;
            }
        }
    }
</script>
<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }
</style>
