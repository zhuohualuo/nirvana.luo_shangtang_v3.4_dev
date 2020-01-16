<template>
  <div id="content">
    <el-row>
      <el-col :span="10" :offset="1">
        <el-row class="replace-tips">选择脚本项目后，点击更新，即可pull最新的脚本代码至服务器</el-row>
        <br/>
        <el-form :model="form" :inline="true" class="demo-form-inline" ref="form1">
          <el-form-item label="脚本项目" prop="script_project" :rules="{ required: true, message: '请选择脚本项目', trigger: 'change' }">
            <el-select v-model="form.script_project" @visible-change="getFirstPath">
              <el-option v-for="item in scriptProject"
                         :value="item.abspath"
                         :key="item.abspath"
                         :label="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="代码分支">
            <el-input v-model="form.script_branch" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updateScript">更新脚本</el-button>
          </el-form-item>
        </el-form>
        <el-row v-show="scriptVisible">
          <div :class="form.scriptStyle" style="max-height: 600px">
            {{form.script_msg}}
          </div>
        </el-row>
      </el-col>
      <el-col :span="1">
        <hr style="width: 1px;height: 700px;border: none;background-color: #E6E6E6;"/>
      </el-col>
      <el-col :span="10">
        <el-row class="replace-tips">选择项目后，点击扫描，即可扫描后台Script目录下已存在的python脚本</el-row>
        <br/>
        <el-form :model="form" ref="form" :rules="formRule">
          <el-row>
            <el-col :span="12">
              <el-form-item label="项目" prop="project_id" label-width="70px">
                <el-select v-model="form.project_id" @change="form.version_id=''" style="width: 100%">
                  <el-option v-for="item in projectList"
                             :value="item.id"
                             :key="item.id"
                             :label="item.name"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="版本" prop="version_id" label-width="70px">
                <el-select v-model="form.version_id"
                           @visible-change="getVersion"
                           :disabled="form.project_id===''"
                           style="width: 100%">
                  <el-option v-for="item in versionList"
                             :value="item.id"
                             :key="item.id"
                             :label="item.version"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="文件夹" prop="folders" label-width="70px">
            <el-input v-model="form.folders"
                      auto-complete="off"
                      @focus="dialogVisible=true"
                      style="width: 80%">
            </el-input>
            <el-button type="primary" @click="scanScript" style="margin-left: 15px">扫描脚本</el-button>
          </el-form-item>
        </el-form>
        <el-row v-show="resultVisible">
          <div :class="form.resultStyle" style="max-height: 550px">
            {{form.result}}
          </div>
        </el-row>
      </el-col>
    </el-row>

    <el-dialog title="文件夹路径" :visible.sync="dialogVisible">
      <div style="width: 85%">
        <el-tree
                :props="defaultProps"
                :load="loadNode"
                ref="tree"
                node-key="name"
                lazy
                render-after-expand
                show-checkbox
                accordion
                check-strictly>
        </el-tree>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="choosedPath">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
    import { getProjectList, getVersionList } from '@/api/project';
    import { scriptScan, getScriptPath, scriptUpdate } from '@/api/others';

    export default {
        name: "scanScript",

        data() {
            return {
                form: {
                    project_id: '',
                    version_id: '',
                    folders: '',
                    result: '',
                    resultStyle: '',
                    script_project: '',
                    script_branch: 'master',
                    script_msg: '',
                    scriptStyle: ''
                },
                defaultProps: {
                    label: 'name',
                    isLeaf: 'leaf'
                },
                projectList: [],
                versionList: [],
                scriptProject: [],
                scriptVisible: false,
                resultVisible: false,
                dialogVisible: false,
                formRule: {
                    project_id: [
                        { required: true, message: '请选择项目', trigger: 'change' },
                    ],
                    version_id: [
                        { required: true, message: '请选择版本', trigger: 'change' },
                    ],
                    folders: [
                        { required: true, message: '请选择文件夹', trigger: 'change' },
                    ]
                }
            }
        },

        computed: {
        },

        mounted() {
          this.getProject();
        },

        methods: {
            scanScript() {
                if (this.validateFormRule('form')) {
                    let self = this;
                    self.form.resultStyle = 'wait-result';
                    self.form.result = '脚本扫描中，请稍候...';
                    self.resultVisible = true;
                    scriptScan({
                        project_id: this.form.project_id,
                        version_id: this.form.version_id,
                        folder: this.form.folders,
                    }).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            self.form.resultStyle = 'success-result';
                        }
                        else {
                            self.form.resultStyle = 'fail-result';
                        }
                        self.form.result = response.data.msg;
                    })
                }
            },
            updateScript() {
                if (this.validateFormRule('form1')) {
                    let self = this;
                    self.form.scriptStyle = 'wait-result';
                    self.form.script_msg = '脚本代码更新中，请稍候...';
                    self.scriptVisible = true;
                    scriptUpdate({
                        project: this.form.script_project,
                        branch: this.form.script_branch,
                    }).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            self.form.scriptStyle = 'success-result';
                        }
                        else {
                            self.form.scriptStyle = 'fail-result';
                        }
                        self.form.script_msg = response.data.msg;
                    })
                }
            },
            getUrlPath(node, list) {
                if (node.parent.data === undefined) {
                    list.push(node.data.name);
                }
                else {
                    this.getUrlPath(node.parent, list);
                    list.push(node.data.name);
                }
            },
            loadNode(node, resolve) {
                let result = [];
                if (node.level === 0) {
                    getScriptPath({path: ""}).then(function (response) {
                        if (response.data.code === 0) {
                            response.data.folders.forEach(function (item) {
                                result.push({"name": item.name})
                            })
                        }
                        if (result === []) {
                            node.isLeaf = true;
                        }
                        resolve(result)
                    })
                }
                if (node.level > 0) {
                    let pathlist = [];
                    this.getUrlPath(node, pathlist);
                    let path = pathlist.join('/');
                    getScriptPath({path: path}).then(function (response) {
                        if (response.data.code === 0) {
                            response.data.folders.forEach(function (item) {
                                result.push({"name": item.name})
                            })
                        }
                        if (result === []) {
                            node.isLeaf = true;
                        }
                        resolve(result)
                    })
                }
            },
            choosedPath() {
                let checkedNodeslist = this.$refs.tree.getCheckedNodes();
                if (checkedNodeslist.length > 1) {
                    this.$notify.error("仅可选择一个路径！");
                    return false;
                }
                if (checkedNodeslist.length < 1) {
                    this.$notify.error("请选择一个路径！");
                    return false;
                }
                if (checkedNodeslist.length === 1) {
                    let data = checkedNodeslist[0];
                    let node = this.$refs.tree.getNode(data.name);
                    let nodePathList = [];
                    this.getUrlPath(node, nodePathList);
                    this.form.folders = nodePathList.join('/');
                    this.dialogVisible = false;
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
            getProject() {
                let self = this;
                getProjectList().then(function (response) {
                    // console.log(response)
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getVersion(flag) {
                let self = this;
                if (flag === true) {
                    getVersionList({project_id: self.form.project_id}).then(function (response) {
                        console.log(response)
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getFirstPath(flag) {
                let self = this;
                if (flag === true) {
                    getScriptPath({path: ""}).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            self.scriptProject = response.data.folders
                        }
                    })
                }
            }
        }
    }
</script>

<style scoped>
    .replace-tips {
      height: 40px;
      line-height: 40px;
      background-color: rgba(66, 185, 131, .1);
      font-size: 20px;
      padding-left: 5px;
    }
    .success-result{
      width: 100%;
      line-height: 30px;
      background-color: rgb(157, 224, 124);
      font-size: 16px;
      padding: 5px;
      overflow: auto;
    }
    .fail-result{
      width: 100%;
      line-height: 30px;
      background-color: rgb(245, 108, 108);
      font-size: 16px;
      padding: 5px;
      overflow: auto;
    }
    .wait-result{
      width: 100%;
      line-height: 30px;
      background-color: rgb(228, 231, 237);
      font-size: 16px;
      padding: 5px;
    }
</style>
