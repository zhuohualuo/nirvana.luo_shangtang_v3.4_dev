<template>
    <div id="content">
        <el-col :span="14">
            <el-row>
                <el-form ref="formValidate" :model="formValidate" :rules="ruleValidate">
                    <el-col :span="6">
                        <el-form-item label="项目" prop="project_id" :label-width="formLabelWidth">
                            <el-select
                                v-model="formValidate.project_id"
                                @change="(val)=>{formValidate.project_id=val}"
                                :disabled="editDisable"
                            >
                                <el-option
                                    v-for="item in projectList"
                                    :value="item.id"
                                    :key="item.id"
                                    :label="item.name"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="版本" prop="version_id" :label-width="formLabelWidth">
                            <el-select
                                v-model="formValidate.version_id"
                                @visible-change="getVersion"
                                @change="()=>{formValidate.module='';formValidate.record_id=''}"
                                style="width: 100%"
                                multiple
                                :disabled="formValidate.project_id===''"
                            >
                                <el-option
                                    v-for="item in versionList"
                                    :value="''+item.id"
                                    :key="item.id"
                                    :label="item.version"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="模块" prop="module" :label-width="formLabelWidth">
                            <el-select
                                v-model="formValidate.module"
                                filterable
                                clearable
                                @visible-change="getModule"
                                :disabled="formValidate.version_id.length===0"
                                @change="formValidate.record_id=''"
                            >
                                <el-option
                                    v-for="item in moduleList"
                                    :value="item"
                                    :key="item"
                                    :label="item"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="接口" prop="record_id" :label-width="formLabelWidth">
                            <el-select
                                v-model="formValidate.record_id"
                                filterable
                                clearable
                                @visible-change="getInterface"
                                :disabled="formValidate.module===''"
                            >
                                <el-option
                                    v-for="item in recordList"
                                    :value="item.id"
                                    :key="item.id"
                                    :label="item.name"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="14">
                        <el-form-item label="模板名称" prop="title" :label-width="formLabelWidth">
                            <el-input v-model.trim="formValidate.title" placeholder="请输入模板名称"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="用例类型" prop="type" :label-width="formLabelWidth">
                            <el-select v-model="formValidate.type" :disabled="editDisable">
                                <el-option
                                    v-for="item in caseTypeList"
                                    :value="item.id"
                                    :key="item.id"
                                    :label="item.type_name"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-form>
            </el-row>

            <el-form>
                <el-form-item>
                    <el-input v-model="formView.title" :title="formView.title" placeholder="title">
                        <span slot="prepend">title</span>
                    </el-input>

                    <el-input v-model="formView.url" :title="formView.url" placeholder="URL">
                        <el-select v-model="formView.method" slot="prepend">
                            <el-option
                                v-for="item in dataModule['method']['options']"
                                :key="item"
                                :label="item"
                                :value="item"
                            ></el-option>
                        </el-select>
                    </el-input>
                    <el-input v-model="formView.rest" :title="formView.rest">
                        <span slot="prepend">rest</span>
                    </el-input>
                    <el-input
                        v-for="item in Object.keys(formView).filter(val=>{return dataModule.others.hasOwnProperty(val)})"
                        :label="item"
                        :key="item"
                        v-model="formView[item]"
                        :title="formView[item]"
                        :class="checkCorrectData(formView[item])"
                    >
                        <span slot="prepend">{{item}}</span>
                        <el-button
                            slot="append"
                            icon="el-icon-delete"
                            @click="$delete(formView,item)"
                        ></el-button>
                    </el-input>

                    <el-select
                        @change="(val)=>{$set(formView,val,'')}"
                        :value="''"
                        placeholder="增加字段"
                    >
                        <el-option
                            v-for="item in Object.keys(dataModule.others).filter(val=>{return !formView.hasOwnProperty(val)})"
                            :label="item"
                            :value="item"
                            :key="item"
                        ></el-option>
                    </el-select>

                    <el-tabs type="border-card">
                        <el-tab-pane
                            v-for="tabName in ['query', 'path','headers','cookie','files']"
                            :key="tabName"
                            :value="tabName"
                            :label="dataModule['params'][tabName]['labelName']"
                        >
                            <el-table
                                :data="tableData(formView.params[tabName])"
                                :span-method="spanMethod"
                                :cell-style="cellStyle"
                                border
                                fit
                                style="width: 100%"
                                height="430"
                            >
                                <el-table-column prop="key" label="参数名">
                                    <template slot-scope="scope">
                                        <el-input
                                            v-model="scope.row.key[0]"
                                            :title="scope.row.key[0]"
                                        >
                                            <el-select
                                                v-model="scope.row.type[0]"
                                                style="width:90px"
                                                slot="append"
                                            >
                                                <el-option
                                                    v-for="item in dataModule['params'][tabName]['typeList']"
                                                    :key="item"
                                                    :label="item"
                                                    :value="item"
                                                ></el-option>
                                            </el-select>
                                        </el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="casename" label="用例名" width="200px">
                                    <template slot-scope="scope">
                                        <el-input
                                            v-model="scope.row.value.casename"
                                            :title="scope.row.value.casename"
                                        ></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="value" label="参数值">
                                    <template slot-scope="scope">
                                        <el-input
                                            v-model="scope.row.value.value"
                                            :title="scope.row.value.value"
                                            :class="checkCorrectData(scope.row.value.value)"
                                        ></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="result" label="结果" width="100px">
                                    <template slot-scope="scope">
                                        <el-button
                                            @click="scope.row.value.result=!scope.row.value.result"
                                        >{{scope.row.value.result?"OK":"ERROR"}}</el-button>
                                    </template>
                                </el-table-column>
                                <el-table-column size="mini" width="95px">
                                    <template slot="header" slot-scope="props">
                                        <el-button
                                            size="mini"
                                            type="primary"
                                            @click="addCases(formView.params[tabName])"
                                            icon="el-icon-plus"
                                        >参数</el-button>
                                    </template>
                                    <template slot-scope="scope" size="mini">
                                        <el-button
                                            type="danger"
                                            icon="el-icon-delete"
                                            circle
                                            @click="removeCase(scope.row.key,scope.row.value,tabName)"
                                        ></el-button>
                                        <el-button
                                            v-if="scope.row.addButton"
                                            type="primary"
                                            icon="el-icon-plus"
                                            circle
                                            @click="addCase(scope.row, tabName)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                        <el-tab-pane label="Body">
                            <el-button
                                type="primary"
                                size="mini"
                                @click="formView.params.body.push({key: '',type: 'dict',children: []})"
                                icon="el-icon-plus"
                            >节点</el-button>
                            <el-button
                                type="primary"
                                size="mini"
                                @click="addCases(formView.params.body)"
                                icon="el-icon-plus"
                            >参数</el-button>
                            <div style="height: 400px;overflow: auto;">
                                <el-tree
                                    :data="formView.params.body"
                                    default-expand-all
                                    :expand-on-click-node="false"
                                    :indent="32"
                                    :props="{children: 'children',label: 'key'}"
                                >
                                    <div class="block" slot-scope="{ node,data}">
                                        <div v-if="data.children">
                                            <el-input
                                                v-model="data.key"
                                                :title="data.key"
                                                placeholder="节点名称"
                                            >
                                                <el-select v-model="data.type" slot="prepend">
                                                    <el-option value="list"></el-option>
                                                    <el-option value="dict"></el-option>
                                                </el-select>
                                            </el-input>
                                            <el-button
                                                type="primary"
                                                size="mini"
                                                @click="data.children.push({key: '',type: 'dict',children: []})"
                                                icon="el-icon-plus"
                                            >节点</el-button>

                                            <el-button
                                                type="primary"
                                                size="mini"
                                                @click="addCases(data.children)"
                                                icon="el-icon-plus"
                                            >参数</el-button>
                                            <el-button
                                                type="danger"
                                                icon="el-icon-delete"
                                                circle
                                                @click="removeNode(node)"
                                            ></el-button>
                                        </div>
                                        <div v-else style="display:flex">
                                            <el-table
                                                :data="tableData([data])"
                                                :span-method="spanMethod"
                                                :cell-style="cellStyle"
                                                :show-header="false"
                                                border
                                            >
                                                <el-table-column label="参数名" width="200px">
                                                    <template slot-scope="scope">
                                                        <el-input
                                                            v-model="scope.row.key[0]"
                                                            :title="scope.row.key[0]"
                                                            placeholder="key"
                                                        >
                                                            <el-select
                                                                v-model="scope.row.type[0]"
                                                                style="width:85px"
                                                                slot="append"
                                                            >
                                                                <el-option
                                                                    v-for="item in dataModule['params']['body']['typeList']"
                                                                    :key="item"
                                                                    :label="item"
                                                                    :value="item"
                                                                ></el-option>
                                                            </el-select>
                                                        </el-input>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="用例名" width="200px">
                                                    <template slot-scope="scope">
                                                        <el-input
                                                            v-model="scope.row.value.casename"
                                                            :title="scope.row.value.casename"
                                                            placeholder="casename"
                                                        ></el-input>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="参数值" width="200px">
                                                    <template slot-scope="scope">
                                                        <el-input
                                                            v-model="scope.row.value.value"
                                                            :title="scope.row.value.value"
                                                            :class="checkCorrectData(scope.row.value.value)"
                                                            placeholder="value"
                                                        ></el-input>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    prop="result"
                                                    label="结果"
                                                    width="100px"
                                                >
                                                    <template slot-scope="scope">
                                                        <el-button
                                                            @click="scope.row.value.result=!scope.row.value.result"
                                                        >{{scope.row.value.result?"OK":"ERROR"}}</el-button>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column size="mini" width="110px">
                                                    <template slot-scope="scope" size="mini">
                                                        <el-button
                                                            type="danger"
                                                            icon="el-icon-delete"
                                                            circle
                                                            @click="removeBodyCase(node,scope.row.value)"
                                                        ></el-button>
                                                        <el-button
                                                            v-if="scope.row.addButton"
                                                            type="primary"
                                                            icon="el-icon-plus"
                                                            circle
                                                            @click="addCase(data, 'body')"
                                                        ></el-button>
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </div>
                                    </div>
                                </el-tree>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="Setup">
                            <el-input
                                type="textarea"
                                :rows="18"
                                v-model="formView.setup"
                                :title="formView.setup"
                                :class="checkCorrectData(formView.setup)"
                                @change="buildJsonStr()"
                            ></el-input>
                        </el-tab-pane>
                        <el-tab-pane label="Teardown">
                            <el-input
                                type="textarea"
                                :rows="18"
                                v-model="formView.teardown"
                                :title="formView.teardown"
                                :class="checkCorrectData(formView.teardown)"
                                @change="buildJsonStr()"
                            ></el-input>
                        </el-tab-pane>
                        <el-tab-pane label="Response">
                            <el-tabs class="autoHeightTabs" @tab-click="responseViewIndex='0'">
                                <el-tab-pane
                                    v-for="(value0, name, index) in formView.response"
                                    :key="index"
                                    :label="name"
                                >
                                    <el-button
                                        @click="addResponseTab(value0)"
                                        type="primary"
                                        size="mini"
                                    >
                                        <i class="el-icon-plus"></i>
                                        新增
                                    </el-button>
                                    <el-tabs v-model="responseViewIndex" tabPosition="left">
                                        <el-tab-pane
                                            v-for="(value, name, index) in value0"
                                            :key="index"
                                        >
                                            <span slot="label">
                                                <i
                                                    class="el-icon-close"
                                                    @click="removeResponseTab(value0,value)"
                                                ></i>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{name.toString()}}
                                            </span>

                                            <el-table
                                                :data="tableData(value)"
                                                :span-method="spanMethod"
                                                height="350"
                                            >
                                                <el-table-column label="参数名">
                                                    <template slot-scope="scope">
                                                        <el-input
                                                            v-model="scope.row.key[0]"
                                                            :title="scope.row.key[0]"
                                                        ></el-input>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    prop="validator"
                                                    label="校验器"
                                                    width="140px"
                                                >
                                                    <template slot-scope="scope">
                                                        <el-select
                                                            slot="append"
                                                            v-model="scope.row.value.key"
                                                            style="width:125px"
                                                        >
                                                            <el-option
                                                                v-for="key in validatorList(value,scope.row)"
                                                                :key="key"
                                                                :label="key"
                                                                :value="key"
                                                            ></el-option>
                                                            <el-button
                                                                slot="append"
                                                                icon="el-icon-search"
                                                            ></el-button>
                                                        </el-select>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="参数值">
                                                    <template slot-scope="scope">
                                                        <el-input
                                                            v-model="scope.row.value.value"
                                                            :title="scope.row.value.value"
                                                            :class="checkCorrectData(scope.row.value.value)"
                                                        ></el-input>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column size="mini" width="85px">
                                                    <template slot="header" slot-scope="props">
                                                        <el-button
                                                            size="mini"
                                                            type="primary"
                                                            @click="addResponseCases(value0)"
                                                            icon="el-icon-plus"
                                                        >参数</el-button>
                                                    </template>
                                                    <template slot-scope="scope" size="mini">
                                                        <el-button
                                                            type="danger"
                                                            icon="el-icon-delete"
                                                            circle
                                                            @click="removeResponseCase(value, scope.row.key, scope.row.value)"
                                                        ></el-button>
                                                        <el-button
                                                            v-if="scope.row.addButton"
                                                            type="primary"
                                                            icon="el-icon-plus"
                                                            circle
                                                            @click="addResponseCase(value, scope.row.key)"
                                                        ></el-button>
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </el-tab-pane>
                                    </el-tabs>
                                </el-tab-pane>
                            </el-tabs>
                        </el-tab-pane>
                    </el-tabs>
                </el-form-item>
            </el-form>
        </el-col>
        <el-col :span="10">
            <!-- <el-alert
                v-if="alert!=''"
                :type="alert.split(' ',2)[0]"
                :description="alert.split(' ',2)[1]"
                show-icon
            ></el-alert> -->
            <div class="_templateJson">
                <textarea id="jsonEditor" v-model="formValidate.json"></textarea>
            </div>
            
            <div class="page-footer-right">
                <el-button
                    type="ghost"
                    @click="handleReset('formValidate')"
                    :disabled="editDisable"
                    size="mini"
                >重置</el-button>
                <el-button
                    type="primary"
                    @click="handleSubmit('formValidate')"
                    style="margin-left: 8px"
                    size="mini"
                >提交</el-button>
                <el-button
                    type="primary"
                    style="margin-left: 8px"
                    @click="formValidate.json=example;buildView()"
                    :disabled="editDisable"
                    size="mini"
                >示例</el-button>
            </div>
            <!-- <pre>{{formView}}</pre> -->
        </el-col>
    </div>
</template>
<script>
import { getProjectList, getVersionList, getModuleList } from "@/api/project";
import { getInterfaceList, generateTemplateCase, updateTemplate, getCaseTypeList, getInvokeList } from "@/api/case";
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/mdn-like.css'
require('script-loader!jsonlint')
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'
export default {
    name: 'createTemplate',
    data() {
        return {
            projectList: [],
            versionList: [],
            moduleList: [],
            recordList: [],
            caseTypeList: [],
            formValidate: {
                id: 0,
                project_id: "",
                version_id: [],
                module: "",
                record_id: "",
                title: "",
                type: "",
                json: ""
            },
            formLabelWidth: '80px',
            ruleValidate: {
                project_id: [{ required: true, message: '请选择项目', trigger: 'change' }],
                version_id: [{ required: true, message: '请选择版本', trigger: 'change' }],
                title: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
                type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
            },
            editDisable: false,
            formView: this.blankViewData(),
            responseViewIndex: "0",
            dataModule: {
                title: {
                    default: ""
                },
                url: {
                    default: ""
                },
                method: {
                    default: "GET",
                    options: ["GET", "POST", "DELETE", "PUT", "HEAD", "CONNECT", "OPTIONS", "TRACE", "PATCH"]
                },
                rest: {
                    default: ""
                },
                setup: {
                    default: ""
                },
                teardown: {
                    default: ""
                },
                params: {
                    query: {
                        default: [],
                        labelName: "Query",
                        typeList: ["string", "bool", "int", "dict", "date", "time", "timestamp", "id"]
                    },
                    path: {
                        default: [],
                        labelName: "Path",
                        typeList: ["string", "int", "timestamp", "id"]
                    },
                    headers: {
                        default: [],
                        labelName: "Headers",
                        typeList: ["string"]
                    },
                    cookie: {
                        default: [],
                        labelName: "Cookie",
                        typeList: ["string"]
                    },
                    body: {
                        default: [],
                        typeList: ["dict", "list", "int", "float", "bool", "string", "enum", "date", "timestamp", "time"]
                    },
                    files: {
                        default: [],
                        labelName: "Files",
                        typeList: ["string"]
                    }

                },
                response: {
                    default: { "ok": [], "error": [] },
                    typeList: ["string", "int", "dict"],
                    validator: {
                        "<>": "list",
                        "=": ["int", "str"],
                        ">": "int",
                        "<": "int",
                        "!=": ["int", "str"],
                        type: "str",
                        re: "str",
                        len: "str",
                        in: "list",
                        notin: "list",
                        notinclude: "list",
                        include: "list",
                        includekey: "list"
                    }
                },
                others: {
                    headers: {},
                    key: {},
                    gl: {},
                    append: {},
                    mock: {},
                    kafka: {},
                    wait: {},
                    thread: {},
                    loop: {},
                    files: {},
                    public: {}
                }
            },
            row: 0,//记录json改变的位置
            col: 0,
            alert: "",
            example: '{"title":"示例模板","url":"http://{{key.host}}:{{key.port}}","method":"PUT","rest":"/auto/case/template/{template_id}","setup":["{{whale_40.upload_image(\'{{key.host}}\',image_path=\'11.jpg\')}}"],"headers":{"Accept":"application/json, text/plain, */*","Content-Type":"application/json;charset=UTF-8"},"params":[{"rest_type":"path","type":"int","name":"template_id","ok":{"模板id在数据库中":"const|{{key.temp_id}}"},"error":{"模板id不存在数据库中":"const|{{key.err_temp_id}}"}},{"rest_type":"headers","type":"string","name":"expire","ok":{"expire存在":"2019-10-15 14:39:08"},"error":{"expire不存在":null}},{"rest_type":"body","type":"dict","branch":{"image":{"type":"list","branch":[{"type":"dict","branch":{"url":{"type":"string","ok":{"url1":"url1"},"error":{"url2":"url2"}},"type":{"type":"string","ok":{"png":"png"},"error":{"jpg":"jpg"}}}}]},"position":{"type":"dict","branch":{"start":{"type":"dict","branch":{"x":{"type":"int","ok":{"start_x为整型":1,"start_x为小数":1.1}},"y":{"type":"int","ok":{"start_y为整型":2,"start_y为小数":2.2}}}},"end":{"type":"dict","branch":{"x":{"type":"int","ok":{"end_x为整型":3}},"y":{"type":"int","ok":{"end_y为整型":3}}}},"center":{"type":"dict","ok":{"坐标为list格式":[0,0]},"error":{"坐标为dict格式":{"x":0,"y":0}}}}},"expire":{"type":"timestamp","ok":{"时间戳类型":"2019-10-15 14:39:08"}}}}],"response":{"ok":{"code":{"=":0},"status_code":{"=":200}},"error":[{"code":{"!=":0},"status_code":{"=":200}},{"status_code":{"!=":200}}]}}'
        }
    },
    mounted() {
        this.getParams();
        this.buildView();
        this.jsonEditor = CodeMirror.fromTextArea(document.getElementById("jsonEditor"), {
            lineNumbers: true,
            mode: 'application/json',
            gutters: ['CodeMirror-lint-markers'],
            theme: 'mdn-like',
            lint: true,
            indentUnit: 4
        });

        this.jsonEditor.on('change', cm => {
            this.formValidate.json = cm.getValue();
            if (document.activeElement.tagName === "TEXTAREA") {
                this.buildView();
            }
        })
    },
    beforeDestroy() {
        this.$store.dispatch("app/toggleParentNav");
    },
    methods: {
        jump2Line(row, col) {
            let editor = this.jsonEditor;
            var x = editor.charCoords({ line: row, ch: 0 }, "local").top;
            var left = editor.charCoords({ line: row, ch: col }, "local").left;
            var middleHeight = editor.getScrollerElement().offsetHeight / 2;
            var middleWidth = editor.getScrollerElement().offsetWidth / 2;
            editor.scrollTo(left < middleWidth ? 0 : left - middleWidth, x - middleHeight - 5);
            var BACK_CLASS = "CodeMirror-activeline-background"
            if (row == 0) { return }
            editor.addLineClass(editor.getLineHandle(row), 'background', BACK_CLASS);
        },
        getParams() {
            // 取到路由带过来的参数
            console.log("$route.params.dataObj", this.$route.params.dataObj)
            this.getProject();
            this.getCaseType();
            if (this.$route.params.dataObj) {
                this.formValidate = this.$route.params.dataObj;
                this.formValidate.version_id = this.formValidate.version_id.toString().split(',');
                this.checkJson();
                this.getVersion(true);
                this.getInterface(true);
                this.editDisable = true;
            }
        },
        getProject() {
            let self = this;
            getProjectList().then(function (response) {
                self.projectList = response.data.projects
            }).catch(function (err) {
            });
        },
        getCaseType() {
            let self = this;
            getCaseTypeList().then(function (response) {
                console.log(response)
                self.caseTypeList = response.data.types;
            }).catch(function (err) {
            });
        },
        getVersion(flag) {
            let self = this;
            if (flag === true) {
                getVersionList({ project_id: self.formValidate.project_id }).then(function (response) {
                    console.log(response)
                    self.versionList = response.data.version;
                }).catch(function (err) {
                });
            }
        },
        getModule(flag) {
            let self = this;
            if (flag === true) {
                getModuleList({
                    project_id: self.formValidate.project_id,
                    version_id: self.formValidate.version_id.join(',')
                }).then(function (response) {
                    console.log(response)
                    self.moduleList = response.data.module;
                }).catch(function (err) {
                });
            }
        },
        getInterface(flag) {
            if (flag === true) {
                let self = this;
                getInterfaceList({
                    project_id: self.formValidate.project_id,
                    version_id: self.formValidate.version_id.join(','),
                    module: self.formValidate.module
                }).then(function (response) {
                    console.log(response)
                    self.recordList = response.data.api_records;
                }).catch(function (err) {
                });
            }
        },
        handleSubmit(name) {
            let ref = this;
            if (ref.validateFormRule(name) && ref.checkJson()) {
                //id大于0时为编辑，小于等于0为新增
                this.formValidate.version_id = this.formValidate.version_id.join(',');
                if (ref.formValidate.id > 0) {
                    updateTemplate(ref.formValidate.id, ref.formValidate).then(function (response) {
                        if (response.data.code === 0) {
                            ref.$message.success('提交成功!');
                            ref.gotoList();
                            ref.handleReset(name);
                        } else {
                            ref.$message.error(response.data.msg);
                            ref.formValidate.version_id = ref.formValidate.version_id.split(',');
                        }
                    }).catch(function (error) {
                    });
                }
                else {
                    generateTemplateCase(ref.formValidate).then(function (response) {
                        if (response.data.code === 0) {
                            ref.$message.success('提交成功!');
                            ref.gotoSave(response.data, ref.getProjectVersionString());
                            ref.handleReset(name);
                        } else {
                            ref.$message.error(response.data.msg);
                            ref.formValidate.version_id = ref.formValidate.version_id.split(',');
                        }
                    }).catch(function (error) {
                    });
                }
            }
        },
        validateFormRule(formName) {
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
        getProjectVersionString() {
            let str = '';
            let self = this;
            self.versionList.forEach(function (item) {
                if (item.id === self.formValidate.version_id) {
                    str = item.project + '_' + item.version;
                }
            })
            return str;
        },
        checkJson() {
            let data = this.formValidate.json;
            if (data) {
                var obj;
                try {
                    //data有可能不是合法的JSON字符串，便会产生异常
                    obj = JSON.parse(data);
                    this.formValidate.json = JSON.stringify(obj, null, 4);
                    return true
                } catch (e) {
                    this.$message.error('不合法的JSON格式!');
                    return false
                }
            }
            else {
                this.$message.error('请输入JSON!');
                return false
            }
        },
        gotoSave(self, string) {
            this.$router.push({
                path: 'caseManage/templateCaseList',
                name: 'templateCaseList',
                params: {
                    dataObj: {
                        data: self,
                        projectVersion: string
                    }
                }
            })
        },
        gotoList() {
            this.$router.push({
                path: 'caseManage/templateList',
                name: 'templateList',
            })
        },
        handleReset(name) {
            if (this.$refs[name] != undefined) {
                this.formValidate = {
                    id: 0,
                    project_id: '',
                    version_id: [],
                    module: '',
                    record_id: '',
                    title: '',
                    type: '',
                    json: ''
                }
                this.formView = this.blankViewData();
                this.$nextTick(() => {
                    this.$refs[name].clearValidate();
                })
            }
        },
        blankViewData() {
            return {
                title: "",
                url: "",
                method: "GET",
                rest: "",
                setup: "",
                teardown: "",
                params: {
                    query: [],
                    path: [],
                    headers: [],
                    cookie: [],
                    body: [],
                    files: [],
                },
                response: { "ok": [], "error": [] },
            }
        },
        job2Frontend(key, value) {
            if ("branch" in value) {
                var res = {};
                switch (value.type) {
                    case "dict":
                        res["key"] = key;
                        res["type"] = value.type;
                        res["children"] = [];
                        var x;
                        for (x in value.branch) {
                            res["children"].push(this.job2Frontend(x, value.branch[x]));
                        }
                        break;
                    case "list":
                        //list格式检查
                        if (!(value.branch.length == 1 && value.branch[0].type == "dict" && value.branch[0].branch)) {
                            throw "list不符合规范";
                        }
                        res["key"] = key;
                        res["type"] = value.type;
                        res["children"] = [];
                        var x;
                        for (x in value.branch[0].branch) {
                            res["children"].push(
                                this.job2Frontend(x, value.branch[0].branch[x])
                            );
                        }
                        break;
                }
                return res;
            } else {
                return this.buildViewCase(key, value);

            }
        },
        buildViewCase(key, value) {
            var res = {};
            res["key"] = [key];
            res["type"] = [value.type];
            var caseSet = [];
            var x;
            for (x in value.ok) {
                let caseOne = {};
                caseOne["result"] = true;
                caseOne["casename"] = x;
                if (Object.prototype.toString.call(value.ok[x]) === '[object String]') {
                    caseOne["value"] = '"' + value.ok[x] + '"'
                } else {
                    caseOne["value"] = JSON.stringify(value.ok[x]);
                }
                caseSet.push(caseOne);
            }
            for (x in value.error) {
                let caseOne = {};
                caseOne["result"] = false;
                caseOne["casename"] = x;
                if (Object.prototype.toString.call(value.error[x]) === '[object String]') {
                    caseOne["value"] = '"' + value.error[x] + '"'
                } else {
                    caseOne["value"] = JSON.stringify(value.error[x]);
                }
                caseSet.push(caseOne);
            }
            res["cases"] = caseSet;
            return res;
        },
        buildCorrectData(data) {
            // 只有符合json格式的内容会被转换
            try {
                let tmp = JSON.parse(data);
                if (Object.prototype.toString.call(tmp) === '[object String]') {
                    return data.replace(/^\"/, '').replace(/\"$/, '')
                } else {
                    return tmp
                }
            } catch (err) {
                if (data == "") {
                    return null;
                } else if (/^\"(.*?)\"$/.test(data)) {
                    return data.replace(/^\"/, '').replace(/\"$/, '')
                }// 执行到这里还没有被转换说明不符合JSON格式，应该提示
            }
        },
        checkCorrectData(data) {
            if(data==undefined){
                return
            }
            try {
                let tmp = JSON.parse(data);
                return
            } catch (err) {
                if (data == "" || /^\"(.*?)\"$/.test(data)) {
                    return
                }
                return "check"
            }
        },
        isVariable(str1, str2) {
            // 判断str1是否出现在str2的单括弧字符串中
            let re = /\{\{(.+?)\}\}/g
            let i = str2.replace(re, '_').indexOf('{' + str1 + '}') >= 0;
            return i > 0
        },
        removeCase(key, casedata, rest_type) {
            let x;
            let view;
            view = this.formView.params[rest_type]
            for (x in view) {
                if (view[x].key === key) {
                    let index = view[x].cases.indexOf(casedata);
                    view[x].cases.splice(index, 1);
                    if (view[x].cases.length === 0) {
                        view.splice(x, 1);
                    }
                    break;
                }
            }
        },
        spanMethod({ row, col, rowIndex, columnIndex }, collist = [0]) {
            if (collist.indexOf(columnIndex) > -1) {
                return { rowspan: row.rowNum, colspan: 1 };
            }
        },
        cellStyle({ row, col, rowIndex, columnIndex }) {
            if (columnIndex === 0) {
                return "vertical-align: baseline";
            }
        },
        addCases(data) {
            let tmp = { key: [""], type: ["string"], cases: [{ casename: "", value: "", result: true }] }
            data.push(tmp);
        },
        addCase(data, rest_type) {
            let x;
            let view = this.formView.params;
            let tmp = { casename: "", value: "", result: false }
            switch (rest_type) {
                case "body":
                    data.cases.push(tmp);
                    return;
                case "query":
                case "path":
                case "headers":
                case "cookie":
                case "files":
                    view = view[rest_type];
                    break;
            }
            for (x of view) {
                if (x.key === data.key) {
                    x.cases.push(tmp);
                    break;
                }
            }
        },
        addResponseCases(data) {
            data[this.responseViewIndex].push({ key: [''], cases: [{ key: '=', value: '' }] })
        },
        addResponseCase(data, key) {
            let tmp = { key: "", value: "" };
            let x;
            for (x of data) {
                if (x.key === key) {
                    x.cases.push(tmp);
                }
            }
        },
        removeResponseCase(data, key, cases) {
            let x;
            let y;
            let z;
            for (x in data) {
                y = data[x]
                if (y.key === key) {
                    for (z in y.cases) {
                        if (y.cases[z] == cases) {
                            y.cases.splice(z, 1)
                            if (y.cases.length == 0) {
                                this.arrayRemove(data, y)
                            }
                        }
                    }
                }
            }
        },
        removeBodyCase(node, casedata) {
            if (node.data.cases) {
                var index = node.data.cases.indexOf(casedata);
                node.data.cases.splice(index, 1);
                if (node.data.cases.length === 0) {
                    this.removeNode(node);
                }
            }
        },
        removeNode(node) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.indexOf(node.data);
            children.splice(index, 1);
        },
        buildResponseView(data) {
            let ref = this
            let x;
            let res = {}
            //组合成response表格用的数据
            function responseTable(data) {
                var res = []
                let x;
                for (x in data) {
                    res.push({ "key": [x], "cases": ref.kvpairs(data[x]) })
                }
                return res
            }
            let k;
            let v;
            for (k of ["ok", "error"]) {
                res[k] = []
                if (data && data[k]) {
                    v = data[k]
                    if (Array.isArray(v)) {
                        for (x of v) {
                            res[k].push(responseTable(x));
                        }
                    } else {
                        res[k].push(responseTable(v));
                    }
                } else {
                    res[k].push([]);
                }
            }
            return res;
        },
        body2Frontend(data) {
            //body的json数据格式到展示用的数据格式
            if (data.length == 0) {
                return []
            } else if (data.length > 1) {
                console.log("不允许多个相同的body参数")
            } else if (data[0].name) {
                var res = {}
                res["key"] = data[0].name;
                res["type"] = data[0].type;
                res["children"] = [];
                let x;
                for (x in data[0].branch) {
                    res["children"].push(this.job2Frontend(x, data[0].branch[x]))
                }
                return [res];
            } else {
                var res = [];
                let x;
                for (x in data[0].branch) {
                    res.push(this.job2Frontend(x, data[0].branch[x]));
                }
                return res;
            }
        },
        file2Frontend(data) {
            if (data.length == 0) {
                return []
            }
            var res = [];
            let x;
            if (data[0].branch) {
                for (x in data[0].branch) {
                    res.push(this.buildViewCase(x, data[0].branch[x]));
                }
            } else {
                for (x of data) {
                    res.push(this.buildViewCase(x.name, x));
                }
            }
            return res;
        },
        query2Frontend(data) {
            var res = [];
            let x;
            if (data.length == 0) {
                return []
            }
            for (x of data) {
                res.push(this.buildViewCase(x.name, x));
            }
            return res;
        },
        buildResponseStr(data) {
            let ref = this;
            var x;
            function responseTable(data) {
                let res = {}
                let x;
                for (x of data) {
                    res[x.key[0]] = x.cases
                }
                for (x in res) {
                    let tmp = {}
                    let y;
                    for (y of res[x]) {
                        tmp[y.key] = ref.buildCorrectData(y.value)
                    }
                    res[x] = tmp
                }
                return res;
            }
            var res = {}
            var k;
            var v;
            for (k in data) {
                v = data[k];
                for (x of v) {
                    if (!this.isEmpty(x)) {
                        if (res[k] && Array.isArray(res[k])) {
                            res[k].push(responseTable(x));
                        } else if (res[k]) {
                            res[k] = [res[k]]
                            res[k].push(responseTable(x));
                        } else {
                            res[k] = responseTable(x);
                        }
                    }
                }
            }
            if (!this.isEmpty(res)) {
                return res
            }
        },

        buildBackendBranch(data) {
            var key;
            var value = {};
            var x;
            var res = {};
            if ("children" in data) {
                key = data.key;
                value["type"] = data.type;
                switch (data.type) {
                    case "list":
                        value["branch"] = [{ type: "dict", branch: {} }]; //历史原因，list作为节点要多写一层
                        for (x in data.children) {
                            Object.assign(
                                value.branch[0].branch,
                                this.buildBackendBranch(data.children[x])
                            );
                        }
                        break;
                    case "dict":
                        value["branch"] = {};
                        for (x in data.children) {
                            Object.assign(
                                value.branch,
                                this.buildBackendBranch(data.children[x])
                            );
                        }
                        break;
                }
                res[key] = value;
                return res;
            } else {
                return this.buildBackendBranchCase(data);
            }
        },
        buildBackendBranchCase(data) {
            var key;
            var value = {};
            var x;
            var res = {};
            key = data.key;
            value["type"] = data.type[0];
            value["ok"] = {};
            value["error"] = {};
            for (x of data["cases"]) {
                value[x.result ? "ok" : "error"][x.casename] = this.buildCorrectData(x.value);
            }
            if (Object.keys(value["error"]).length < 1) {
                delete value["error"]
            }
            res[key] = value;
            return res;
        },
        buildBackendCase(data, rest_type) {
            var x;
            var y;
            var res = [];
            if (data.length == 0) {
                return []
            }
            for (x of data) {
                var tmp = {};
                tmp["rest_type"] = rest_type;
                tmp["type"] = x.type[0];
                tmp["name"] = x.key[0];
                tmp["ok"] = {};
                tmp["error"] = {};
                for (y of x.cases) {
                    tmp[y.result ? "ok" : "error"][y.casename] = this.buildCorrectData(y.value);
                }
                if (Object.keys(tmp["error"]).length < 1) {
                    delete tmp["error"]
                }
                res.push(tmp);
            }
            return res;
        },
        frontend2Backend(data, rest_type) {
            var x;
            if (data.length == 0) {
                return []
            }
            switch (rest_type) {
                case "body":
                    var tmp = {};
                    tmp["rest_type"] = rest_type;
                    tmp["type"] = "dict";
                    tmp["branch"] = {};
                    for (x of data) {
                        Object.assign(tmp.branch, this.buildBackendBranch(x));
                    }
                    return [tmp];
                    break;
                case "files":
                    if (data.length < 2) {
                        return this.buildBackendCase(data, rest_type)
                    }
                    else {
                        var tmp = {};
                        tmp["rest_type"] = rest_type;
                        tmp["type"] = "dict";
                        tmp["branch"] = {};
                        for (x of data) {
                            Object.assign(tmp.branch, this.buildBackendBranchCase(x));
                        }
                        return [tmp];
                    }
            }
        },
        tableData(data) {
            var x;
            var y;
            var res = [];
            for (x of data) {
                for (y in x.cases) {
                    let tmp = {};
                    tmp["key"] = x.key;
                    tmp["value"] = x.cases[y];
                    tmp["rowNum"] = y == 0 ? x.cases.length : 0;
                    tmp["addButton"] = !(y < x.cases.length - 1)
                    tmp["type"] = x.type;//response的type为空
                    res.push(tmp);
                }
            }
            return res;
        },
        buildJsonStr() {
            //生成JSON
            let resultObj = {};
            let view = this.formView
            resultObj["title"] = view.title || "";
            resultObj["url"] = view.url || "";
            resultObj["method"] = view.method || "GET";
            resultObj["rest"] = view.rest || "";
            resultObj["setup"] = view.setup ? this.buildCorrectData(view.setup) : undefined;
            resultObj["teardown"] = view.teardown ? this.buildCorrectData(view.teardown) : undefined;
            let i;
            for (i in this.dataModule.others) {
                resultObj[i] = this.buildCorrectData(view[i]);
            }
            resultObj["params"] = []
            var tmp = {}
            tmp["queryStr"] = this.buildBackendCase(view.params.query, "query")
            tmp["pathStr"] = this.buildBackendCase(view.params.path, "path")
            tmp["headersStr"] = this.buildBackendCase(view.params.headers, "headers")
            tmp["cookieStr"] = this.buildBackendCase(view.params.cookie, "cookie")

            tmp["bodyStr"] = this.frontend2Backend(view.params.body, "body");
            tmp["fileStr"] = this.frontend2Backend(view.params.files, "files");
            let x;
            for (x in tmp) {
                resultObj["params"] = resultObj["params"].concat(tmp[x]);
            }
            resultObj["response"] = this.buildResponseStr(view.response);
            this.formValidate.json = JSON.stringify(resultObj, null, 4);
            // this.checkResult(this.formValidate.json);
            this.setEditor(this.formValidate.json)
        },
        buildView() {
            let resultObj;
            var view = {};
            try {
                resultObj = JSON.parse(this.formValidate.json);
                // this.checkResult(this.formValidate.json);
            } catch (err) {
                return;
            }
            view.title = resultObj["title"];
            view.url = resultObj["url"];
            view.method = resultObj["method"] ? resultObj["method"].toUpperCase() : undefined;
            view.rest = resultObj["rest"];
            view.setup = JSON.stringify(resultObj["setup"]);
            view.teardown = JSON.stringify(resultObj["teardown"]);
            let x;
            for (x in this.dataModule.others) {
                if (resultObj[x] != undefined) {
                    view[x] = JSON.stringify(resultObj[x]);
                }
            }
            let queryObj = resultObj["params"].filter((item) => {
                return item.rest_type === 'query';
            })
            let pathObj = resultObj["params"].filter((item) => {
                return item.rest_type === 'path';
            })
            let headersObj = resultObj["params"].filter((item) => {
                return item.rest_type === 'headers';
            })
            let cookieObj = resultObj["params"].filter((item) => {
                return item.rest_type === 'cookie';
            })
            let bodyObj = resultObj["params"].filter((item) => {
                return item.rest_type === 'body';
            })
            let fileObj = resultObj["params"].filter((item) => {
                return item.rest_type === 'files';
            })
            view.params = {}
            view.params.query = this.query2Frontend(queryObj);
            view.params.path = this.query2Frontend(pathObj);
            view.params.headers = this.query2Frontend(headersObj);
            view.params.cookie = this.query2Frontend(cookieObj);
            view.params.body = this.body2Frontend(bodyObj);
            view.params.files = this.file2Frontend(fileObj);
            view.response = this.buildResponseView(resultObj["response"]);
            this.formView = view;

        },
        kvpairs(a) {
            let res = []
            let x
            for (x in a) {
                let tmp;
                if (Object.prototype.toString.call(a[x]) === '[object String]') {
                    tmp = '"' + a[x] + '"'
                } else {
                    tmp = JSON.stringify(a[x]);
                }
                res.push({ "key": x, "value": tmp })
            }
            return res
        },
        removeResponseTab(data, i) {
            event.stopPropagation()
            let x;
            let y;
            let activeName = this.responseViewIndex;
            for (x in data) {
                if (data[x] == i) {
                    data.splice(x, 1)
                }
            }
            if (activeName == x.toString()) {
                if (data[x + 1]) {
                    activeName = (x + 1).toString()
                } else if ((x - 1) > 0) {
                    activeName = (x - 1).toString()
                } else {
                    activeName = "0"
                }
            }
            if (Number(activeName) > data.length - 1) {
                activeName = (data.length - 1).toString()
            }
            this.responseViewIndex = activeName;
        },
        addResponseTab(data) {
            data.push([])
            this.responseViewIndex = (data.length - 1).toString();
        },
        arrayRemove(arr, item) {
            var i;
            for (i in arr) {
                if (arr[i] === item) {
                    arr.splice(i, 1)
                }
            }
        },
        isEmpty(value) {
            return (Array.isArray(value) && value.length === 0) || (Object.prototype.isPrototypeOf(value) && Object.keys(value).length === 0);
        },
        setEditor(jsonStr) {
            //设置编辑器内容并且跳转到变化部分
            let oldstr = this.jsonEditor.getValue().split("\n") //按行获取json
            let newstr = jsonStr.split("\n");
            let x = this.row;   //json改变的位置
            let y = this.col;
            //获取跳转位置
            for (x in newstr) {
                if (newstr[x] != oldstr[x]) {
                    for (y in newstr[x]) {
                        if (newstr[x][y] != oldstr[x][y]) {
                            this.row = x;
                            this.col = y;
                            break
                        }
                    }
                    break
                }
            }
            this.jsonEditor.setValue(jsonStr);  //输出到editor
            this.jump2Line(this.row, this.col); //跳转到改变位置或者原位置
        },
        validatorList(tableData, rowData) {
            let tmp = tableData.filter((item) => { return item.key == rowData.key })    //该行对应的参数数据
            let ownValidatorList = tmp[0].cases.map(a => a.key) //当前参数拥有的校验器列表
            return Object.keys(this.dataModule['response']['validator']).filter(val => { return ownValidatorList.indexOf(val) < 0 })
        },
        checkResult(data) {
            let json = JSON.parse(data)
            let x;
            for (x of ["title", "url", "method"]) {
                if (!json[x]) {
                    this.alert = "error 请填写" + x;
                    return;
                }
            }
            // this.alert = Object.prototype.toString.call(json.headers) === '[object String]'?"warning headers格式需要为{}":""
            if (json.params.length == 0) {
                this.alert = "error 请填写params"
                return
            }
            function unpackBranch(branch) {
                let x;
                let res = [];
                for (x in branch) {
                    if (branch[x].branch) {
                        res = res.concat(unpackBranch(branch[x].branch))
                    } else {
                        branch[x].name=x
                        res.push(branch[x])
                    }
                }
                return res;
            }
            // let caseNameList=[];
            for (x of json.params) {
                switch (x.rest_type) {
                    case "query":
                    case "path":
                    case "cookie":
                    case "headers":
                        // if (caseNameList.indexOf(x.name)>0){
                        //     this.alert = "error 用例\"params\">>\"" + x.rest_type + "\">>\"" + x.name + "\"命名冲突"
                        //     return
                        // }
                        // caseNameList.push(x.name)
                        if (this.isEmpty(x.ok)) {
                            this.alert = "error 请填写参数\"params\">>\"" + x.rest_type + "\">>\"" + x.name + "\"的ok情况"
                            return
                        }
                        break;
                    case "files":
                        if (x.name && this.isEmpty(x.ok)) {
                            this.alert = "error 请填写参数\"params\">>\"" + x.rest_type + "\">>\"" + x.name + "\"的ok情况"
                            return
                        }
                        let i;
                        for (i in x.branch) {
                            if (this.isEmpty(x.branch[i].ok)) {
                                this.alert = "error 请填写参数\"params\">>\"" + x.rest_type + "\">>\"" + i + "\"的ok情况"
                                return
                            }
                        }
                        break;
                    case "body":
                        let tmp=unpackBranch(x.branch);
                        for (i of unpackBranch(x.branch)) {
                            if (this.isEmpty(i.ok)) {
                                this.alert = "error 请填写参数\"params\">>\"" + x.rest_type + "\">>\"" + i.name + "\"的ok情况"
                                return
                            }
                        }
                        break;
                    default:
                        this.alert = "error 不支持的params字段\"" + x.rest_type + "\""
                        return
                }
            }
            this.alert = ""
        }
    },
    watch: {
        formView: {
            handler(newValue, oldValue) {
                if (document.activeElement.tagName != "TEXTAREA") {
                    this.buildJsonStr();
                }
            },
            deep: true
        }
    }
};
</script>

<style scoped>
.check >>> .el-input__inner {
    background-color: #ff8888;
}
.check >>> .el-textarea__inner {
    background-color: #ff8888;
}
.left {
    float: left;
    margin-bottom: 30px;
}
.el-tree >>> .el-tree-node__content {
    height: auto;
}
.el-button--medium.is-circle {
    padding: 4px;
}
.el-tree {
    min-width: 100%;
    display: inline-block !important;
}
.el-tree >>> .el-tree-node__children {
    display: contents;
}
._templateJson >>> .CodeMirror {
    max-height: 100%;
    min-height: 750px;
    font-size: 16px;
}
.el-input >>> .el-input-group__prepend {
    width: 98px;
}
.el-tabs >>> .el-tabs__content {
    height: 470px;
    overflow: auto;
}
.autoHeightTabs >>> .el-tabs__content {
    height: auto;
}
.page-footer-right {
    display: block;
    position: fixed;
    left: 86%;
    bottom: 15px;
}
.CodeMirror-activeline-background {
    background: #d9eae8;
}
</style>
<style>
.cm-s-mdn-like .cm-string {
    font-style: normal !important;
}
</style>