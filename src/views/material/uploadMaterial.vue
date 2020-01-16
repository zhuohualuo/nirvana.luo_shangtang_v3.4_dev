<template>
  <div class="content">
    <el-row style="margin-bottom: 10px">
      <el-button type="warning" size='small' class='float_lef' @click="goToList">
        <svg-icon icon-class="return"></svg-icon> 返回素材列表
      </el-button>
    </el-row>
    <div class="body-content-box">
      <span>上传路径：</span>
      <el-input v-model="defaultPath"
                auto-complete="off"
                @focus="dialogVisible=true"
                style="width: 400px"
                size="small"></el-input>
      <el-button type="success" size="small" @click="submitUpload">上 传</el-button>

      <div style="margin-left: 7%;margin-top: 15px;width: 65%">
        <el-upload
                class="upload-demo"
                ref="upload"
                drag
                multiple
                action="/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-upload="beforeFileUpload"
                :file-list="fileList"
                :auto-upload='false'
                :http-request="handleUpload">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击选取文件</em></div>
          <div class="el-upload__tip" slot="tip">
            <span>支持图片、文本、压缩包等常用文件格式，大小不超过50M</span>
          </div>
        </el-upload>
      </div>
    </div>
    <hr style="height: 1px;border: none;background-color: #E6E6E6;    margin-right: 9%;
    margin-top: 20px;" v-if="upResult&&upResult.length"/>
    <div v-if="upResult&&upResult.length" style="
    margin-left: 9%;
">
        <span>上传结果:</span>
        <ul class="upResultStyle">
          <li v-for="(item,index) in upResult" :key="index">
            <span><i class="el-icon-document" style="margin-right:7px;"></i>{{item.fileName}}</span>
            <span><i :class="item.isSuccess == '上传成功'?'el-icon-success':'el-icon-error'" :style="{color:item.isSuccess == '上传成功'?'#67c23a':'#F56C6C'}"></i></span>
          </li>
        </ul>
      </div>
    <el-dialog title="上传路径" :visible.sync="dialogVisible">
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

    <el-dialog :visible.sync="currentVisible" width="30%">
      <el-form :model="tmpFile" ref="form" :rules="formRule">
        <el-form-item label="文件名称" label-width="80px" prop="name">
          <el-input v-model.trim="tmpFile.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="currentVisible = false">取 消</el-button>
        <el-button type="primary" @click="changeName">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
    import { getMaterialList } from '@/api/others';
    import axios from 'axios'
    import Cookies from "js-cookie";
    const rootPath = process.env.BASE_API;

    export default {
        name: "uploadMaterial",
        data() {
            return {
                upResult:[],
                file: {},
                fileList: [],
                defaultProps: {
                    label: 'name',
                    isLeaf: 'leaf'
                },
                defaultPath: 'material',
                dialogVisible: false,
                newFolderVisible: false,
                currentVisible: false,
                newFolderName: '',
                newFolderFather: {},
                newFileName: {},
                tmpFile: {
                    name: '',
                    size: ''
                },
                currentFile: {},
                formRule: {
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' },
                        { max: 75, message: '名称长度不能超过75个字符', trigger: 'blur' },
                    ]
                }
            };
        },
        mounted() {

        },
        methods: {
            bytesToSize(bytes) {
                if (bytes === 0) return '0 B';
                let k = 1000, // or 1024
                    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                    i = Math.floor(Math.log(bytes) / Math.log(k));
                return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
            },
            beforeFileUpload(file){
                if(file.size / 1024 / 1024 > 50){
                    this.$notify({
                        message: "文件" + file.name + "超过50MB！当前大小："+this.bytesToSize(file.size),
                        type: 'error'
                    });
                    return false
                }
                return true
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
                    result.push({"name": "material"});
                    resolve(result)
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
                                if(item.dir === true){
                                    result.push({"name": item.name})
                                }
                            })
                        }
                        if(result === []){
                            node.isLeaf = true;
                        }
                        resolve(result)
                    })
                }
            },
            choosedPath(){
                let checkedNodeslist = this.$refs.tree.getCheckedNodes();
                if(checkedNodeslist.length < 1){
                    this.$notify.error("请选择一个文件夹路径！");
                    return false;
                }
                if(checkedNodeslist.length > 1){
                    this.$notify.error("仅可选择一个路径！");
                    return false;
                }
                if(checkedNodeslist.length === 1){
                    let data = checkedNodeslist[0];
                    let node = this.$refs.tree.getNode(data.name);
                    let nodePathList = [];
                    this.getUrlPath(node, nodePathList);
                    this.defaultPath = nodePathList.join('/');
                    this.dialogVisible = false;
                }
            },
            append(data){
                this.newFolderFather = data;
                this.newFolderVisible = true;
            },
            addFolder(){
                let newChild = { label: this.newFolderName, children: [] };
                this.newFolderName = '';
                if (!this.newFolderFather.children) {
                    this.$set(this.newFolderFather, 'children', []);
                }
                this.newFolderFather.children.push(newChild);
            },
            handleRemove(file, fileList) {

            },
            handlePreview(file) {
                this.currentFile = file;
                this.tmpFile.name = file.name.toString();
                this.tmpFile.size = this.bytesToSize(file.size);
                this.currentVisible = true;
            },
            changeName(){
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        this.currentFile.name = this.tmpFile.name;
                        this.newFileName[this.currentFile.uid] = this.tmpFile.name;
                        this.currentVisible = false;
                    } else {
                        return false;
                    }
                });
            },
            handleUpload(item){
                let file = item.file;
                let uid = file.uid;
                let name = '';
                let formData = new FormData();
                if(this.newFileName[uid]){
                    name = this.newFileName[uid];
                }
                else{
                    name = file.name;
                }
                formData.append('file', file);
                let self = this;
                axios.post(
                    rootPath + '/common/material/upload?path=' + this.defaultPath + '&name=' + name,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'token': Cookies.get("token"),
                            'uidNumber': Cookies.get("uidNumber")
                        }
                    }).then(function (res) {
                    if(res.data.code === 0){
                        self.$notify({
                            message: "文件" + name + "上传成功！",
                            type: 'success'
                        });
                        item.onError();
                        self.upResult.push({fileName:name,isSuccess:'上传成功'})
                    } else {
                        self.$notify({
                            message: "文件" + name + "上传失败：" + res.data.msg,
                            type: 'error'
                        });
                        self.upResult.push({fileName:name,isSuccess:'上传失败'})
                    }
                })

            },
            submitUpload() {
                this.$refs.upload.submit();
            },
            goToList(){
                this.$router.push({
                    path: '/common/materialList',
                    name: 'materialList'
                })
            }
        }
    }
</script>
<style scope>
  input[type="file"] {
    display: none;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .body-content-box{
    margin-left: 30%;
  }
  .upResultStyle{
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding-right: 15%;
  }
  .upResultStyle li{
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 40px;
  }
  .upResultStyle .isSuccessTrue{
    background-color: #67c23a;
    color: #fff;
    padding: 1px 14px;
    border-radius: 10px;
  }
  .upResultStyle .isSuccessFalse{
    background-color: #a6a9ad;
    color: #fff;
    padding: 1px 14px;
    border-radius: 10px;
  }
</style>
<style>
  .body-content-box .el-upload-list{
    max-height: 120px;
    overflow-y: auto;
  }
</style>

