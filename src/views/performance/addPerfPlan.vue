<template>
    <div id="content">
        <el-row>
            <el-form :model="form" ref="form" style="height:30px">
                <el-col :span="10">
                    <el-form-item label="任务名称" :label-width="formLabelWidth" prop="title"
                                  :rules="{validator: checkTitle, required: true, trigger: 'change'}">
                        <el-input v-model.trim="form.title" auto-complete="off" size="small"
                                  placeholder="请输入任务名称，不可以数字开头" >
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="8" :offset="1">
                    <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id"
                                  :rules="{ required: true, message: '测试类型不能为空', trigger: 'change' }">
                        <el-select v-model="form.project_id" size="small" @change="getList" style="width:50%" >
                            <el-option v-for="(item,index) in projectList" :label="item.name" :value="item.id" :key="index"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-form>
        </el-row>
        <el-row>
            <el-col :span="10">
                <el-card shadow="never">
                    <el-form :inline="true" class="_bottom0 demo-form-inline _right">
                        <el-form-item>
                            <el-input v-model="source.people" placeholder="操作人" clearable size="mini" style="width: 120px"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input v-model="source.name" placeholder="关键字" clearable size="mini" style="width: 120px"></el-input>
                        </el-form-item>
                    </el-form>
                    <el-table  height="590" border class='_table sourceShowList' header-cell-class-name="_table-head"  size="mini"
                               :data="sourceShowList" @select-all="sourceSelectAll" @selection-change="sourceSelectionChange">
                        <el-table-column type="selection"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="title" :render-header="renderSourceHeader"></el-table-column>
                    </el-table>
                </el-card>
            </el-col>
            <el-col :span="2">
                <div style="margin-left:35%;margin-top:300px">
                    <el-button type="primary" icon="el-icon-arrow-left" circle @click="targetToSource" :class="targetSelection.length=='0'?'leftOrRight':''"></el-button>
                </div>
                <br/>
                <div style="margin-left: 35%">
                    <el-button type="primary" icon="el-icon-arrow-right" circle @click="sourceToTarget" :class="sourceSelection.length=='0'?'leftOrRight':''"></el-button>
                </div>
            </el-col>
            <el-col :span="11">
                <el-card shadow="never">
                    <el-form :inline="true" class="_bottom0 demo-form-inline _right">
                        <el-form-item>
                            <el-input v-model="target.people" placeholder="操作人" clearable size="mini" style="width: 120px"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input v-model="target.name" placeholder="关键字" clearable size="mini" style="width: 120px"></el-input>
                        </el-form-item>
                    </el-form>
                    <el-table height="590" border class='_table targetShowList' header-cell-class-name="_table-head" size="mini"
                              :data="targetShowList" @selection-change="targetSelectionChange"  @select-all="targetSelectAll">
                        <el-table-column type="selection"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="title" label="测试任务集（已选择）"></el-table-column>
                        <el-table-column :render-header="renderTargetHeader" width="110">
                            <template slot-scope="scope">
                                <el-button type="text" @click="editConfig(scope.row)" style="text-decoration: underline">编辑配置</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>
        <div class="page-footer-right">
            <el-button type="ghost" @click="resetForm" :disabled="form.id!=''">重 置</el-button>
            <el-button type="primary" @click="savePerfManage">提 交</el-button>
        </div>
        <el-dialog title="编辑配置" :visible.sync="dialogEdit">
            <config-table :tableColumn="tableColumn" :tableData="configForm" :height="450"></config-table>

            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogEdit = false">取 消</el-button>
                <el-button type="primary" @click="saveConfigManage">确 认</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import { getProjectList } from "@/api/project";
    import { addPlan, updatePlan } from "@/api/performance";
    import { getPerfSetList, getConfig, sendConfig } from "@/api/performance";
    import { getKeyList } from "@/api/config";
    import { getTestsetList } from "@/api/testset";
    import ConfigTable from "../../components/ConfigTable/index";

    export default {
        name: "addPerfPlan",
        components: {ConfigTable},
        data() {
            return {
                form: {
                    id: "",
                    title: "",
                    project_id: "",
                    set_ids: [],
                    executor: "",
                    run_status: "",
                    config: {},
                    config_id: {}
                },
                perfList: {
                    page_no: 1,
                    page_size: 10,
                    count: 0,
                    programData: []
                },
                checkTitle: (rule, value, callback) => {
                    if (!value) {
                        callback(new Error("任务名称不能为空"));
                    }
                    if (/^\d/.test(value)) {
                        callback(new Error("任务名称不可以数字开头"));
                    }else {
                        callback();
                    }
                },
                source: { name: "", people: "", type: "", setList: [], num: 20 },
                target: { name: "", people: "", type: "", setList: [], num: 20 },
                sourceSelection: [],
                targetSelection: [],
                sourceTmp: [],
                targetTmp: [],
                projectList: [],
                formLabelWidth: "100px",
                dialogEdit: false,
                configForm: [],
                userConfig: {},
                currentSetId: "",
                currentRow: {},
                tableColumn:[
                    {label:"参数",key:"name",type:"input",require:true},
                    {label:"值",key:"value",type:"input",require:true},
                ],
            };
        },
        computed: {
            sourceShowList: function() {
                let name = this.source.name.toLowerCase();
                let people = this.source.people.toLowerCase();
                let type = this.source.type;
                let num = this.source.num;
                this.sourceSelection = [];
                this.sourceTmp = this.source.setList.filter(function(item) {
                    return (
                        (name === "" || item.title.toLowerCase().indexOf(name) > -1) &&
                        (people === "" || item.executor.toLowerCase().indexOf(people) > -1) &&
                        (type === "" || type === item.type)
                    );
                });
                return this.sourceTmp.slice(0, num);
            },
            targetShowList: function() {
                let name = this.target.name.toLowerCase();
                let people = this.target.people.toLowerCase();
                let type = this.target.type;
                let num = this.target.num;
                this.targetSelection = [];
                this.targetTmp = this.target.setList.filter(function(item) {
                    return (
                        (name === "" || item.title.toLowerCase().indexOf(name) > -1) &&
                        (people === "" || item.executor.toLowerCase().indexOf(people) > -1) &&
                        (type === "" || type === item.type)
                    );
                });
                return this.targetTmp.slice(0, num);
            }
        },
        mounted() {
            this.getProject();
            this.getParams();
        },
        beforeDestroy() {
            this.$store.dispatch('app/toggleParentNav')
        },
        methods: {
            goToList() {
                this.$router.push({
                    path: "/perf/perfTaskPlan",
                    name: "perfTaskPlan"
                });
            },
            getParams() {
                if (this.$route.params.dataObj) {
                    let self = this.$route.params.dataObj;
                    this.resetForm();
                    this.form = {
                        title: self.title,
                        project_id: self.project_id,
                        set_ids: self.set_ids,
                        id: self.id,
                        config_id: self.config_id
                    };
                    if (JSON.stringify(this.form.config_id) != "{}") {
                        for (var key in this.form.config_id) {
                            let tem = [];
                            for (var i in this.form.config_id[key]) {
                                tem.push({
                                    name: i,
                                    value: this.form.config_id[key][i],
                                    description: ""
                                });
                            }
                            this.userConfig[key] = tem;
                        }
                    }
                    this.getTaskSet(self);
                }
            },
            getTaskSet(e) {
                let self = this;
                let crt = e;
                let targettmp = [];
                getPerfSetList({
                    project_id: crt.project_id
                }).then(function(response) {
                    let sets = response.data.sets;
                    JSON.parse(crt.set_ids).forEach(function(id) {
                        sets.map((item, index) => {
                            if (item.id == id) {
                                targettmp.push(item);
                                sets.splice(index, 1);
                            }
                        });
                    });
                    self.source = { name: "", people: "", type: "", setList: [], num: 20 };
                    self.target = { name: "", people: "", type: "", setList: [], num: 20 };
                    self.source.setList = sets;
                    self.target.setList = targettmp;
                })
                    .catch(function(err) {});
            },
            getProject() {
                let self = this;
                getProjectList()
                    .then(function(response) {
                        self.projectList = response.data.projects;
                    })
                    .catch(function(err) {});
            },
            getList() {
                let targettmp = [];
                let self = this;
                getPerfSetList({
                    page_no: this.form.page_no,
                    page_size: this.form.page_size,
                    executor: this.form.executor,
                    project_id: this.form.project_id,
                    run_status: this.form.status,
                    id: this.form.id
                }).then(function(response) {
                    let sets = response.data.sets;
                    self.source = {
                        name: "",
                        people: "",
                        type: "",
                        setList: [],
                        num: 20
                    };
                    self.target = {
                        name: "",
                        people: "",
                        type: "",
                        setList: [],
                        num: 20
                    };
                    self.source.setList = sets;
                    self.target.setList = targettmp;
                });
            },
            editConfig(self) {
                this.configForm = [];
                this.currentSetId = self.id;
                if (this.userConfig[self.id]) {
                    this.configForm = this.userConfig[self.id];
                } else {
                    this.getConfigItem(self.id);
                }
                this.dialogEdit = true;
            },
            getConfigItem(val) {
                getConfig(val).then(i => {
                    if (i.data.code == 0) {
                        for (var key in i.data.data) {
                            this.configForm.push({
                                name: key,
                                value: i.data.data[key].toString(),
                                description: ""
                            });
                        }
                    } else {
                        this.$message.error(i.data.msg);
                    }
                });
            },
            saveConfigManage() {
                this.dialogEdit = false;
                this.userConfig[this.currentSetId] = this.configForm;
            },
            resetForm() {
                if (this.$refs["form"] != undefined) {
                    this.$refs["form"].resetFields();
                    this.form = {
                        id: "",
                        title: "",
                        project_id: "",
                        config_id: "",
                        set_ids: []
                    };
                }
                this.source = {
                    name: "",
                    people: "",
                    type: "",
                    setList: [],
                    num: 20
                };
                this.target = {
                    name: "",
                    people: "",
                    type: "",
                    setList: [],
                    num: 20
                };
                this.userConfig = {};
            },
            savePerfManage() {
                let ref = this;
                ref.form.set_ids = [];
                if (ref.validateFormRule("form")) {
                    let obj = {};
                    if (ref.targetTmp && ref.targetTmp.length) {
                        ref.targetTmp.map(item => {
                            if (ref.userConfig[item.id]) {
                                obj[item.id] = {};
                                if (
                                    ref.userConfig[item.id] &&
                                    ref.userConfig[item.id].length
                                ) {
                                    ref.userConfig[item.id].map(it => {
                                        obj[item.id][it.name] = it.value;
                                    });
                                }
                            }
                        });
                    }
                    ref.form.config = ref.userConfig;
                    ref.target.setList &&
                    ref.target.setList.length &&
                    ref.target.setList.map(item => {
                        ref.form.set_ids.push(item.id);
                    });
                    if (this.$route.params.dataObj != undefined) {
                        updatePlan(ref.form.id, {
                            title: ref.form.title,
                            set_ids: ref.form.set_ids,
                            config: ref.form.config
                        }).then(function(response) {
                            if (response.data.code === 0) {
                                ref.$message.success("提交成功！");
                                ref.goToList();
                            } else {
                                ref.$message.error(response.data.msg);
                            }
                        });
                    } else {
                        addPlan(ref.form).then(function(response) {
                            if (response.data.code === 0) {
                                ref.$message.success("提交成功！");
                                ref.goToList();
                            } else {
                                ref.$message.error(response.data.msg);
                            }
                        });
                    }
                } else {
                    return false;
                }
            },
            validateFormRule(formName) {
                let result = false;
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        console.log("validate true");
                        result = true;
                    } else {
                        console.log("validate false");
                    }
                });
                return result;
            },
            sourceSelectionChange(val) {
                this.sourceSelection = val;
            },
            targetSelectionChange(val) {
                this.targetSelection = val;
            },
            sourceSelectAll(val) {
                if (val.length === 0) {
                    return;
                }
                if (
                    this.source.name === "" &&
                    this.source.people === "" &&
                    this.source.type === ""
                ) {
                    this.sourceSelection = this.source.setList;
                } else {
                    this.sourceSelection = this.sourceTmp;
                }
            },
            targetSelectAll(val) {
                if (val.length === 0) {
                    return;
                }
                if (
                    this.target.name === "" &&
                    this.target.people === "" &&
                    this.target.type === ""
                ) {
                    this.targetSelection = this.target.setList;
                } else {
                    this.targetSelection = this.targetTmp;
                }
            },
            sourceToTarget() {
                this.source.setList = this.source.setList.filter(item => {
                    for (let select of this.sourceSelection) {
                        if (select.id === item.id) {
                            return false;
                        }
                    }
                    return true;
                });
                this.target.setList = this.sourceSelection.concat(
                    this.target.setList
                );
            },
            targetToSource() {
                this.target.setList = this.target.setList.filter(item => {
                    for (let select of this.targetSelection) {
                        if (select.id === item.id) {
                            return false;
                        }
                    }
                    return true;
                });
                this.source.setList = this.targetSelection.concat(
                    this.source.setList
                );
            },
            renderSourceHeader(h, { column, $index }) {
                return h("span", [
                    h("span", "测试任务集（未选择）"),
                    h(
                        "span",
                        { style: "float: right" },
                        this.sourceSelection.length + "/" + this.sourceTmp.length
                    )
                ]);
            },
            renderTargetHeader(h, { column, $index }) {
                return h("span", [
                    h("span", "操作"),
                    h(
                        "span",
                        { style: "float: right" },
                        this.targetSelection.length + "/" + this.targetTmp.length
                    )
                ]);
            }
        }
    };
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
    .link-in-table {
        color: #0066cc;
        text-decoration: none;
    }
    .link-in-table:hover {
        color: #008489;
        text-decoration: underline;
    }
    .sourceShowList .el-select {
        display: none;
    }
    .sourceShowList .current-row .el-select {
        display: block;
    }
    .sourceShowList .current-row .el-select + span {
        display: none;
    }
    .targetShowList .el-select {
        display: none;
    }
    .targetShowList .current-row .el-select {
        display: block;
    }
    .targetShowList .current-row .el-select + span {
        display: none;
    }
</style>