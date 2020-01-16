<template>
  <div class="body-content">
    <el-card>
      <el-row>
        <el-col :span="12" :offset="1">
          <el-radio-group v-model="selectTool" @change="switchTool">
            <el-radio v-for="item in selectTools" :key="item.id" :label="item.id"   border style="width: 150px;">{{item.name}}</el-radio>
          </el-radio-group>
        </el-col>
        <el-col :span="7">
          <span>host</span>
          <el-input v-model="host" placeholder="请输入ip:port" style="width: 150px" :disabled="selectTool==1"> </el-input>
        </el-col>
        <el-col :span="3">
          <div>
            <el-button  size='small' v-on:click="submitUpload()" type="success" >上 传</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-if="selectTool==0">
      <div class="upload">
        <div class="upload_warp">
          <div class="upload_warp_left" @click="fileClick">
            <img src="../../../static/img/upload.png">
            <span>单击上传文件（支持多文件）</span>
          </div>
          <div class="upload_warp_right" @drop="drop($event)" @dragenter="dragenter($event)" @dragover="dragover($event)">
            或将文件拖到此处（支持多文件）
          </div>
        </div>
      </div>
    </el-card>

    <el-card v-if="selectTool==1">
      <div class="upload">
        <div class="upload_warp">
          <div class="upload_warp_left" >
            <el-row>
              <template>
                <div class="block" style="margin-left: 15px" >
                  <span class="left">left</span>
                  <el-slider :max="fileWidth" v-model="cordinate.left" show-input></el-slider>
                </div>
              </template>
            </el-row>
            <el-row>
              <template>
                <div class="block" style="margin-left: 15px">
                  <span class="top">top</span>
                  <el-slider :max="fileHeight" v-model="cordinate.top" show-input></el-slider>
                </div>
              </template>
            </el-row>
            <el-row>
              <template>
                <div class="block" style="margin-left: 15px">
                  <span class="right">right</span>
                  <el-slider :max="fileWidth" v-model="cordinate.right" show-input></el-slider>
                </div>
              </template>
            </el-row>
            <el-row>
              <template>
                <div class="block" style="margin-left: 15px">
                  <span class="bottom">bottom</span>
                  <el-slider :max="fileHeight" v-model="cordinate.bottom" show-input></el-slider>
                </div>
              </template>
            </el-row>
          </div>
          <div class="upload_warp_right" @drop="drop($event)" @dragenter="dragenter($event)" @dragover="dragover($event)">
            将文件拖到此处（支持单文件）
          </div>
        </div>
      </div>
    </el-card>

    <el-card>
      <div class="upload_warp_text">
        <!--<img :src="getImage" >-->
        选中{{preimgList.length}}张文件，共{{bytesToSize(this.size)}}
      </div>
      <div class="upload_warp_input">
        <form action="/" method="post" enctype="multipart/form-data" id="files" ref="files">
          <input @change="fileChange($event)" type="file" id="upload_file" ref="upload_file" multiple style="display: none"/>
        </form>
      </div>
      <div class="upload_warp_img" v-show="preimgList.length!=0">
        <div class="upload_warp_img_div" v-for="(item,index) of preimgList">
          <div class="upload_warp_img_div_top">
            <div class="upload_warp_img_div_text">
              {{item.name}}
            </div>
            <img src="../../../static/img/del.png" class="upload_warp_img_div_del" @click="fileDel(index)">
          </div>
          <img :src="item.src">
        </div>
      </div>
    </el-card>


    <el-dialog title="执行结果" class="result" :visible.sync="dialogVisible">
      <el-row v-show="selectTool==0">

        <el-card>
          <el-radio-group v-model="selectType" >
            <el-radio v-for="item in selectTypes" :key="item.id" :label="item.id"   border style="width: 230px">{{item.name}}</el-radio>
          </el-radio-group>
          <el-button type="primary" size='small' @click="imageProcess">执 行</el-button>
        </el-card>
      </el-row>

      <el-row  >
        <el-card style="height: 70px;" >
          <el-row >
            <el-col :span="3" :offset="15">
              <div>
                <el-tag type="info">TOTAL {{totalList.total.length}}</el-tag>
              </div>
            </el-col>
            <el-col :span="3">
              <div>
                <el-tag type="success">PASS {{passList.pass.length}}</el-tag>
              </div>
            </el-col>
            <el-col :span="3">
              <div>
                <el-tag type="danger">FAIL {{failList.fail.length}}</el-tag>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-row>

      <el-row>
        <el-card  class="_upload">
          <el-table :data="totalList.total"
                    height="400" border class='_table ShowList' header-cell-class-name="_table-head"
                    size="mini" v-loading="loading">
            <el-table-column type="index" label="序号"   align="center"></el-table-column>
            <el-table-column prop="image_name" label="图片名" align="center" ></el-table-column>
            <el-table-column
                    prop="source_image"
                    header-align="center"
                    align="center"
                    label="原图">
              <template slot-scope="scope">
                <el-popover
                        placement="right"
                        title=""
                        trigger="hover">
                  <img :src=getImage(scope.row.source_image)  style="max-height: 800px;max-width: 800px"/>
                  <img slot="reference" :src=getImage(scope.row.source_image) :alt="getImage(scope.row.source_image)" style="max-height: 50px;max-width: 130px">
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column
                    prop="image_path"
                    header-align="center"
                    align="center"
                    label="画框图"
                    v-if="showResult">
              <template slot-scope="scope">
                <el-popover
                        placement="right"
                        title=""
                        trigger="hover">
                  <img :src=getImage(scope.row.image_path)  style="max-height: 800px;max-width: 800px"/>
                  <img slot="reference" :src=getImage(scope.row.image_path)  :alt="getImage(scope.row.image_path)" style="max-height: 50px;max-width: 130px">
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column prop="image_name" label="状态" class="status" align="center" >
              <template slot-scope="scope">
                <div v-if="scope.row.status=='PASS'">
                  <el-tag type="success" size="medium">{{scope.row.status}}</el-tag>
                </div>
                <div v-else>
                  <el-tooltip :class=scope.row.status effect="dark" :content=scope.row.detail placement="top-start" v-if="">
                    <el-button type="danger" size="mini">{{scope.row.status}}</el-button>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>

        </el-card>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="clearImage()">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import request from '@/utils/request'
  import axios from 'axios'
  import {getFeature, detectAndQuality,imageClear} from '@/api/others';
  import Cookies from "js-cookie";
  const rootPath = process.env.BASE_API;

  export default {
    name:'imageProcess',
    data() {
      return {
        host:'',
        headers: {
          uidNumber: Cookies.get("uidNumber")
        },

        selectTypes:[{"id":0,"name":"人脸图片检测人脸与质量评分"},{"id":1,"name":"获取单张人脸特征"}],
        selectType:0,
        selectTools:[{"id":0,"name":"接口画框"},{"id":1,"name":"手动画框"}],
        selectTool:0,

        loading : false,
        dialogVisible: false,

        sourceImg:[],  //源图片所在路径列表
        imgList: [],   //导入图片列表
        preimgList: [], //预览图片列表，包含图片数据
        size: 0,
        msg: "", //错误提示

        totalList:{num:10,total:[]}, //所有图片返回结果
        totalTmp:[],
        passList:{num:10,pass:[]},
        failList:{num:10,fail:[]},
        failTmp: [],
        successTmp:[],

        cordinate:{left:0,top:0,right:0,bottom:0},
        fileWidth:0,
        fileHeight:0,

        showResult:false
      };
    },


    computed:{

    },

    mounted() {
    },
    methods: {
      /********** 选择图片 ************/
      fileClick() {
        document.getElementById('upload_file').click()
      },
      fileChange(el) {
        if (!el.target.files[0].size) return;
        this.fileList(el.target);
        el.target.value = ''
      },
      fileList(fileList) {
        let files = fileList.files;
        for (let i = 0; i < files.length; i++) {
          //判断是否为文件夹
          if (files[i].type != '') {
            this.fileAdd(files[i]);
          } else {
            //文件夹处理
            this.folders(fileList.items[i]);
          }
        }
      },
      //文件夹处理
      folders(files) {
        let _this = this;
        //判断是否为原生file
        if (files.kind) {
          files = files.webkitGetAsEntry();
        }

        files.createReader().readEntries(function(file) {
          if(_this.selectTool==1){
            if(file.length>1){
              _this.$message.error("请上传单个文件")
            }
          }else {
            for (let i = 0; i < file.length; i++) {
              if (file[i].isFile) {
                _this.foldersAdd(file[i]);
              } else {
                _this.folders(file[i]);
              }
            }
          }
        })

      },
      foldersAdd(entry) {
        let _this = this;
        entry.file(function (file) {
          _this.fileAdd(file)
        })
      },
      fileAdd(file) {
        //总大小

        //判断是否为图片文件
        if (file.type.indexOf('image') == -1) {
          this.$message.error("请上传图片")
        }
        else if(this.imgList.length>100 || this.imgList.size>900){
          this.$message.error("上传图片超过100张或图片大小超过900M")
        }
        else {
          let ref = this;
          if(ref.selectTool==0){
            ref.size = ref.size + file.size;
            ref.imgList.push(file)
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
              let temp = {}
              temp.size = file.size;
              temp.src = this.result;
              temp.name = file.name;
              ref.preimgList.push(
                  temp
              )
            }
          }else if(ref.selectTool==1){
            ref.size = file.size
            ref.imgList = []
            ref.imgList.push(file)
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
              let temp = {}
              temp.size = file.size;
              temp.src = this.result;
              temp.name = file.name;
              ref.preimgList = [];
              ref.preimgList.push(temp)
              let image = new Image()
              image.src = this.result;
              image.onload = function() {
                ref.fileWidth = this.width
                ref.fileHeight = this.height
              }
            }
          }
        }
      },
      fileDel(index) {
        this.size = this.size - this.preimgList[index].size;//总大小
        this.preimgList.splice(index, 1);
        this.imgList.splice(index, 1);
      },
      bytesToSize(bytes) {
        if (bytes === 0) return '0 B';
        let k = 1000, // or 1024
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
      },
      dragenter(el) {
        el.stopPropagation();
        el.preventDefault();
      },
      dragover(el) {
        el.stopPropagation();
        el.preventDefault();
      },
      drop(el) {
        el.stopPropagation();
        el.preventDefault();
        this.fileList(el.dataTransfer);
      },
      /********** 选择图片 ************/

      isValidIP(ip){
        var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
        return reg.test(ip);
      },

      switchTool(){
        this.imgList = []
        this.preimgList = []
        this.size = 0;
        this.fileHeight = 0;
        this.fileWidth = 0;
      },

      resetForm(){
        let ref = this;
        ref.passList = {pass:[],num:10}
        ref.failList = {fail:[],num:10}
        ref.totalList = {total:[],num:10}
        ref.showResult = false;
      },

      submitUpload() {
        let ref = this;
        this.resetForm()
        ref.loading = true
        if(ref.imgList.length==0){
          ref.$message.error("请先上传图片！")
        }else if(ref.isValidIP(ref.host)==false && ref.selectTool==0){
          ref.$message.error("ip地址非法")
        } else if(ref.selectTool==1 && (ref.cordinate.bottom <= ref.cordinate.top || ref.cordinate.left>= ref.cordinate.right) ) {
          ref.$message.error("坐标输入有误！")
        }
        else {
          let formData = new FormData();
          for (var i=0;i<ref.imgList.length; i++){
            let file = ref.imgList[i];
            formData.append('images_'+i,file );
          }
          ref.dialogVisible = true;
          let url = ''
          if(ref.selectTool==0){
            url = rootPath +'/image/process/imageUpload'
            formData.append("host",ref.host)
          }else if(ref.selectTool==1){
            url = rootPath +'/image/process/drawRectangle'
            formData.append("top",ref.cordinate.top)
            formData.append("right",ref.cordinate.right)
            formData.append("bottom",ref.cordinate.bottom)
            formData.append("left",ref.cordinate.left)
            ref.showResult = true;
          }
          axios.post(
              url,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  'token': Cookies.get("token"),
                  'uidNumber': Cookies.get("uidNumber")
                }
              }
          ).then(function(response) {
            console.log("submitUpload:", response)
            if (response.data.code==3){
              ref.msg =  response.data.msg;
              ref.passList = {pass:[],num:10}
              ref.failList = {fail:[],num:10}
              ref.$message.error(ref.msg)
            }else {
              if(ref.selectTool==0) {
                ref.passList.pass = response.data.save;
                ref.sourceImg = response.data.save;
                ref.failList.fail = response.data.not_save;
              }else if(ref.selectTool==1){
                ref.passList.pass = response.data.success;
                ref.failList.fail = response.data.fail;
              }
              ref.totalList.total = ref.failList.fail.concat(ref.passList.pass)
              ref.loading = false;
            }
          })
        }
        console.log("showResult:",ref.showResult)
      },


      imageProcess(){
        this.resetForm()
        let ref  = this;
        ref.loading = true
        if (ref.sourceImg.length==0) {
          ref.$message.error("图片上传失败,请重新上传")
        }else {
          if (ref.selectType == 0) {
            detectAndQuality({"imagelist": ref.sourceImg}).then(function(response) {
              if (response.data.code == 3) {
                ref.msg = response.msg;
                ref.passList = {pass:[],num:10}
                ref.failList = {fail:[],num:10}
                ref.$message.error(msg)
              } else {
                ref.passList.pass = response.data.success;
                ref.failList.fail = response.data.fail;
              }
              ref.totalList.total = ref.failList.fail.concat(ref.passList.pass)
              ref.loading = false;
              ref.showResult = true;
            })
          } else {
            getFeature({"imagelist": ref.sourceImg} ).then(function(response) {
              console.log("code:",response)
              if (response.data.code == 3) {
                ref.msg = response.data.msg;
                ref.passList = {pass:[],num:10}
                ref.failList = {fail:[],num:10}
                ref.$message({
                  message:ref.msg,
                  type: 'error'
                });
                // ref.$message.error(ref.msg)
              } else {
                ref.failList.fail = response.data.fail;
                ref.passList.pass = response.data.success;
              }
              ref.totalList.total = ref.failList.fail.concat(ref.passList.pass)
              ref.loading = false;
              ref.showResult = true;
            })
          }
          this.dialogVisible = true
        }
      },

      clearImage(){
        this.dialogVisible = false;
        let ref = this;
        imageClear({"imagelist": ref.sourceImg}).then(function(response) {
          if (response.data.code == 3) {
            ref.$message.error(response.data.msg)
          }
        })

      },

      getImage: function(image_path){
        return rootPath +'/image/process/getImage/'+ image_path
      },

    }
  }
</script>


<style>
  .upload_warp_img_div_del {
    position: absolute;
    top: 6px;
    width: 16px;
    right: 4px;
  }

  .upload_warp_img_div_top {
    position: absolute;
    top: 0;
    width: 100%;
    height: 30px;
    background-color: rgba(0, 0, 0, 0.4);
    line-height: 30px;
    text-align: left;
    color: #fff;
    font-size: 12px;
    text-indent: 4px;
  }

  .upload_warp_img_div_text {
    white-space: nowrap;
    width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .upload_warp_img_div img {
    max-width: 100%;
    max-height: 100%;
    vertical-align: middle;
  }

  .upload_warp_img_div {
    position: relative;
    height: 100px;
    width: 120px;
    border: 1px solid #ccc;
    margin: 0px 30px 10px 0px;
    float: left;
    line-height: 100px;
    display: table-cell;
    text-align: center;
    background-color: #eee;
    cursor: pointer;
  }

  .upload_warp_img {
    border-top: 1px solid #D2D2D2;
    padding: 14px 0 0 14px;
    overflow: hidden
  }

  .upload_warp_text {
    text-align: left;
    margin-bottom: 10px;
    padding-top: 10px;
    text-indent: 14px;
    border-top: 1px solid #ccc;
    font-size: 14px;
  }

  .upload_warp_right {
    float: left;
    width: 40%;
    margin-left: 2%;
    height: 100%;
    border: 1px dashed #999;
    border-radius: 4px;
    line-height: 130px;
    color: #999;
  }

  .upload_warp_left img {
    margin-top: 32px;
  }

  .upload_warp_left {
    float: left;
    width: 55%;
    height: 100%;
    border: 1px dashed #999;
    border-radius: 4px;
    cursor: pointer;
  }

  .upload_warp {
    margin: 14px;
    height: 230px;
  }

  .upload {
    border: 1px solid #ccc;
    background-color: #fff;
    width: 710px;
    box-shadow: 0px 1px 0px #ccc;
    border-radius: 4px;
  }

  .body-content {
    width: 750px;
    margin-left: 25%;
    text-align: center;
  }
</style>
