<template>
    <div id="content">
        <el-row>
            <el-col :span="22">
                <el-button type="warning" size='small' icon="el-icon-arrow-up" @click="goBack" v-show="selfPath!==''">返回上一级</el-button>
                <span style="margin-left: 15px;font-size: 16px">{{selfPath}}</span>
            </el-col>
            <!--<el-col :span="2">-->
                <!--<el-button type="primary" size='small' @click="upload">上传素材</el-button>-->
            <!--</el-col>-->
        </el-row>
        <el-row>
            <el-table :data="materialList"
                      highlight-current-row
                      height="720" border class='_table' header-cell-class-name="_table-head"
                      @row-dblclick="clickFolder">
                <el-table-column type="index" label="序号" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip label="素材名称" prop="name" sortable>
                    <template slot-scope="scope">
                        <div>
                            <span v-if="scope.row.dir === false" style="font-size: 16px">{{scope.row.name}}</span>
                            <span v-if="scope.row.dir === true" style="font-size: 16px">
                                <img style="vertical-align:middle" src="../../../static/img/folder-s.png">{{scope.row.name}}
                            </span>
                        </div>
                    </template>
                </el-table-column>
                <!--<el-table-column show-overflow-tooltip prop="owner" label="创建人" width="150"></el-table-column>-->
                <el-table-column label="类型" width="250">
                    <template slot-scope="scope">
                        <span v-if="scope.row.dir === true">文件夹</span>
                        <span v-if="scope.row.dir === false">{{getFileType(scope.row.name)}}</span>
                    </template>
                </el-table-column>
                <!--<el-table-column show-overflow-tooltip prop="create_time" label="生成日期" width="200"></el-table-column>-->
            </el-table>
        </el-row>

    </div>
</template>

<script>
    import { getMaterialList } from '@/api/others';

    export default {
        name: "materialList",
        data(){
            return {
                materialList: [],
                parentPath: '',
                selfPath: '',
            }
        },
        methods: {
            initList(path){
                this.selfPath = path;
                let ref = this;
                getMaterialList({path: path}).then(function (response) {
                    console.log(response)
                    if(response.data.code === 0){
                        ref.materialList = response.data.materials;
                        ref.parentPath = ref.getParentPath(path);
                    }
                    else{
                        ref.$message.error(response.data.msg);
                    }
                })
            },
            getFileType(fileName){
                return fileName.substring(fileName.lastIndexOf('.') + 1);
            },
            clickFolder(row, event){
                if(row.dir === true){
                    this.initList(row.abspath)
                }
            },
            goBack(){
                let path = this.parentPath;
                this.initList(path);
            },
            upload(){
                this.$router.push({
                    path: '/common/uploadMaterial',
                    name: 'uploadMaterial',
                    params: {
                        path: this.selfPath
                    }
                })
            },
            getParentPath(path){
                let result = '';
                if(path != undefined){
                    let tmp = path.split("/");
                    tmp.pop(-1);
                    result = tmp.join("/");
                }
                return result;
            }
        },
        mounted(){
            this.initList('');
        }
    }
</script>

<style scoped>
    .time {
        font-size: 13px;
        color: #999;
    }

    .bottom {
        margin-top: 13px;
        line-height: 12px;
    }

    .button {
        padding: 0;
        float: right;
    }

    .image {
        width: 100%;
        display: block;
        cursor: pointer;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    .file-name{
        font-size:14px;
        display:block;
        max-width:10em;
        max-height:10em;
        overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
        padding: 5px 10px 0 10px;
        cursor: pointer;
    }
</style>
