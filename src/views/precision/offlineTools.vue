<template>
    <div id="offlineTools">
        <el-row>
            <el-form :inline="true" class="_bottom0 demo-form-inline">
                <el-form-item>
                    <el-button type="primary" size='small' @click="updataTool">更新工具</el-button>
                </el-form-item>
                <!-- <el-form-item>
                    <el-button type="primary" size='small' @click="openTerminal">打开终端</el-button>
                </el-form-item> -->
                <el-form-item>
                    <el-button type="primary" size='small' @click="viewTerminalReport">查看终端报告</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row>
            <el-table 
            v-loading="loading2"
            element-loading-text="拼命加载中"
            :data="List.programData" border stripe class='_table' ref="table">
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="key" label="工具名称" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="description" label="工具描述"></el-table-column>
                <el-table-column show-overflow-tooltip prop="create_time" label="更新时间" width="240"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <el-dialog :title="toolKey+'参数'" :visible.sync="dialogToolDetail" width="35%">
            <el-form :model="form" :disabled="isView" label-position="right" label-width="80px" ref="formRules">
                <el-form-item :label="item.key.replace(/-/g,'')" v-for="(item,index) in toolParame" :key="index" :label-width="formLabelWidth" 
                :rules="[{ required: item.require, message: '不可以为空', trigger: 'change' }]"
                :prop="item.key"
            >
                    <template  v-if="item.type === 'file'">
                            <div contenteditable="true" class="tag-input-wrapper" v-if="item['values']&&item['values'].length != 0" @click="focusOnFileInput(item.key,index)">
                                <span style="margin-left:10px"></span>
                                <el-tag
                                        v-for="(tag,tag_index) in item['values']"
                                        :key="tag_index"
                                        closable
                                        :disable-transitions="false"
                                        size="medium"
                                        @close="handleClose(item.key,index,tag)"> {{tag}}
                                </el-tag>
                            </div>
                            <el-input 
                                    v-else
                                    :placeholder="item.description" @focus="focusOnFileInput(item.key,index)">
                            </el-input>
                    </template>
                    <el-select
                            v-else-if="item.type === 'single_select'"
                            v-model="form[item.key]"
                            :title="item.description"
                            :placeholder="item.description">
                        <el-option v-for="op in item.options" :value="op" :label="''+op" :key="op"></el-option>
                    </el-select>
                    <el-input v-model.trim="form[item.key]" :placeholder="item.description" v-else></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogToolDetail = false">取 消</el-button>
                    <el-button type="primary" @click="dialogToolDetails()">确 定</el-button>
            </div>
        </el-dialog>
        
        <el-dialog title="选择素材（请选择文件夹）" :visible.sync="dialogVisible">
            <el-tree
                    :props="props"
                    :load="loadNode"
                    ref="tree"
                    node-key="abspath"
                    style="max-height: 400px;overflow-y: auto;"
                    lazy
                    render-after-expand
                    show-checkbox
                    accordion
                    check-strictly>
            </el-tree>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="choosedMaterial">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import TableOperator from "../../components/TableOperator/index";
    import { getToolList, getToolParams, getRunTool, getToolUpdate,getToolReport} from '@/api/precision';
    import { getMaterialList } from '@/api/others';
    const rootPath = process.env.BASE_API;
    export default {
        name: 'offlineTools',
        components: {
            TableOperator
        },
        data() {
            return {
                report:'',
                loading2: false,
                toolKey:'',//工具的name
                temParams:'',//用户输入 工具的参数
                offlineData:'',
                props: {
                    label: 'name',
                    isLeaf: 'leaf'
                },
                dialogVisible:false,
                form:{},
                toolParame:[],
                focusedInput: {},
                statusInfo:{},
                versionInfo:{},
                dialogToolDetail:false,
                formLabelWidth: '100px',
                isView: false,
                List: {
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                operateArray: [
                    {label:'运行',type:"primary", click:this.getToolParame,disable:(row)=>{return row.active==0}},
                    {label:'查看报告', type:"success", click:this.lookReport}
                ],
            }
        },
        mounted() {
            this.initList();
        },
        computed: {
        },
        // 自定义指令
        directives:{
            drag(el,bindings){
                el.onmousedown = function(e){
                    e.preventDefault();
                    var disx = e.pageX - el.offsetLeft;
                    var disy = e.pageY - el.offsetTop;
                    document.onmousemove = function (e){
                        el.style.left = e.pageX - disx+'px';
                        el.style.top = e.pageY - disy>-110?e.pageY - disy+'px':'-110px';
                    }
                    document.onmouseup = function(){
                        document.onmousemove = document.onmouseup = null;
                    }
                }
            }
        },
        methods: {
            viewTerminalReport(){
                var encodedString = btoa("report/offline_tools/terminal");
                getToolReport({path:encodedString}).then(e=>{
                    console.log('e',e)
                })
                window.open(rootPath +"/precision/file/list?path="+ encodedString);
            },
            lookReport(self){
                var encodedString = btoa("report/offline_tools/"+self.key);
                getToolReport({path:encodedString}).then(e=>{
                    console.log('e',e)
                })
                window.open(rootPath +"/precision/file/list?path="+ encodedString);
            },
/*             openTerminal(){
                this.toolKey = '';
                window.open("/static/offlineTools.html?id="+btoa(JSON.stringify({form:{},path:rootPath})), rootPath)
            }, */
            handleClose(key,index,tag){
                var tmp = this.toolParame[index]["values"]
                tmp.map((item,index)=>{
                    if(item == tag){
                        tmp.splice(index,1);
                    }
                })
                this.toolParame[index]["values"] = tmp;
            },
            loadNode(node, resolve){
                let result = [];
                if (node.level === 0) {
                    getMaterialList().then(function (response) {
                        if(response.data.code === 0){
                            response.data.materials.forEach(function(item)
                            {
                               result.push({"name": item.name,"abspath":item.abspath})
                            })
                            resolve(result)
                        }
                    })
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
                                result.push({"name": item.name,"abspath":item.abspath})
                            })
                        }
                        if(result === []){
                            node.isLeaf = true;
                        }
                        resolve(result)
                    })
                }
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
            choosedMaterial(){
                let self = this;
                let checkedNodeslist = self.$refs.tree.getCheckedNodes();
                let tmp = [];
                if(checkedNodeslist&&checkedNodeslist.length > 1) return this.$message.error('素材路径只能选择一个！')
                if(checkedNodeslist.length > 0){
                    checkedNodeslist.forEach(function(item){
                        let node = self.$refs.tree.getNode(item.abspath);
                        let nodePathList = [];
                        self.getUrlPath(node, nodePathList);
                        if(tmp.indexOf("material/" + nodePathList.join('/'))===-1){
                            tmp.push("material/" + nodePathList.join('/'));
                        }
                        self.$refs.tree.setChecked(item.abspath,false)
                    })
                }
                self.$set(self.toolParame[self.focusedInput.index],'values',tmp)
                self.form[self.focusedInput.key] = tmp.join(',')
                self.dialogVisible = false;
            },
            focusOnFileInput(key,index){
                this.dialogVisible = true;
                let tempList = this.toolParame[index]['values'];
                if(tempList !== undefined && tempList.length != 0){
                    let choosedList = tempList[0].split(",");
                    choosedList.map((v,i,a)=>{
                        this.$refs.tree.setChecked(v.split("/").slice(1).join('/'),true)
                    })
                }
                this.focusedInput = {key: key, index: index};
            },
            dialogToolDetails(){
                if(this.validateFormRule('formRules')){
                    this.dialogToolDetail = false;
                    this.form['name'] = this.toolKey;
                    getRunTool(this.form).then( e=>{
                        if(e.data.code == 0){
                            //弹出终端
                            window.open("/static/offlineTools.html?id="+btoa(encodeURI(JSON.stringify({form:e.data.result,path:rootPath,name:this.toolKey}))), e.data.result.log_path)
                        }else{
                            this.$message.error(e.data.msg); 
                        }
                        }).catch(function (err) {
                    })
                }
            },
            initList(){
                getToolList().then((e)=>{
                    if(e.data.code === 0){
                        this.List.programData = e.data.results;
                    }else{
                        this.$message.error(r.data.msg)
                    }
                }).catch(function (err) {
                });
            },
            getToolParame(self) {
                this.toolKey = self.key;
                this.form = {};
                getToolParams({name:self.key}).then(e=>{
                    if(e.data.code === 0 ){
                        this.toolParame = e.data.results;
                    }else{
                        this.$message.error(e.data.msg)
                    }
                })
                this.dialogToolDetail = true;
                this.$nextTick(()=>{
                    this.$refs['formRules'].clearValidate();
                })
            },
            updataTool(){
                this.loading2 = true;
                getToolUpdate().then(e=>{
                    this.loading2 = false;
                    if(e.data.code === 0){
                        this.$message({
                            message: e.data.msg,
                            type: 'success'
                        })
                        this.initList();
                    }else{
                        this.$message.error(e.data.msg)
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
        }
    }
</script>
<style scoped>
.tag-input-wrapper{
    margin-left: 5px;
    max-height:150px;
    min-height:35px;
    overflow-y: auto;
    border: 1px solid #dcdfe6;
    border-radius:5px
}
._table {
    height: 766px;
    overflow: auto;
}
</style>

