<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' icon="el-icon-plus" @click="addTestSet">新 增</el-button>
                <el-button type="danger" @click="delTestSetBatch" size="small">删 除</el-button>
                <el-checkbox v-model="form2.viewMyTask" size="small" @change="viewTask" class="mine-checkbox">只看我的</el-checkbox>
            </div>
            <advance-filter :formData="form2" :filterArray="filterArray" :showNumber="4" @search="seachCondition"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="testSetList.programData" ref="table"
                      height="680" border class='_table' header-cell-class-name="_table-head"
                      @selection-change="handleSetSelectionChange">
                <el-table-column type="selection"></el-table-column>
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="id" label="ID" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="测试集名称"></el-table-column>
                <el-table-column show-overflow-tooltip label="项目/版本" width="170">
                    <template slot-scope="scope">
                        <span>{{strFormat(scope.row.project)}} / {{strFormat(scope.row.version)}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="type" label="类型" :formatter="typeFormat" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="cfg_name" label="配置项" width="120"></el-table-column>
                <el-table-column show-overflow-tooltip label="运行状态" width="180">
                    <template slot-scope="scope">
                        <div v-if="statusList[scope.row.id] == 2" >
                            <el-progress :stroke-width="8" :percentage="progressList[scope.row.id].percent"></el-progress>
                            <span>当前执行用例ID：{{progressList[scope.row.id].case_id}}</span>
                        </div>
                        <span v-if="statusList[scope.row.id] != 2" :class="'span-'+statusTagType(statusList[scope.row.id])">{{statusTagFormat(statusList[scope.row.id])}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="执行时间" width="180">
                    <template slot-scope='props'>
                        <div v-if="progressList[props.row.id]">
                            <div class="table-text">{{'开始：'+progressList[props.row.id].start_time}}</div>
                            <div class="table-text">{{'结束：'+progressList[props.row.id].end_time}}</div>
                            <div class="table-text">{{'持续：'+progressList[props.row.id].duration}}</div>
                        </div>
                        <div v-else>
                            <div class="table-text">开始：</div>
                            <div class="table-text">结束：</div>
                            <div class="table-text">持续：</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="更新时间" width="180">
                    <template slot-scope='props'>
                        <div class="table-text">{{'修改：'+dateFormat(props.row.updated_time)}}</div>
                        <div class="table-text">{{'创建：'+dateFormat(props.row.created_time)}}</div>
                    </template>
                </el-table-column>
                <el-table-column label="人员" width="170">
                    <template slot-scope='props'>
                        <div class="table-text">{{'修改：'+strFormat(props.row.modifiedby)}}</div>
                        <div class="table-text">{{'创建：'+strFormat(props.row.owner)}}</div>
                    </template>
                </el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block" style='float:right'>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[10, 15, 20, 50, 100]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="testSetList.count">
            </el-pagination>
        </div>

        <el-dialog :title="editDisable?'编辑测试集':'新建测试集'" :visible.sync="dialogFormVisible" width="70%" @open="timeoutClose" @close="closeEdit">
            <el-row>
                <el-form :model="form" :rules="formRule" ref="form" style="margin-bottom: 10px;">
                    <el-col :span="18">
                        <el-form-item label="测试集名称" :label-width="formLabelWidth" prop="title">
                            <el-input v-model.trim="form.title" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4" :offset="1">
                        <el-form-item label="测试集类型" :label-width="formLabelWidth" prop="type">
                            <el-select v-model="form.type" @change="()=>{if(form.version_id)getCase()}">
                                <el-option v-for="item in caseTypeList" :value="item.id" :key="item.id" :label="item.type_name"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                            <el-select v-model="form.project_id"
                                       @change="()=>{form.version_id=''; form.module=''; form.config=''; form.case_ids=[]}">
                                <el-option
                                        v-for="(item,index) in projectList"
                                        :label="item.name"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5" :offset="1">
                        <el-form-item label="版本" :label-width="formLabelWidth" prop="version_id">
                            <el-select v-model="form.version_id"
                                       :disabled="form.project_id===''"
                                       @visible-change="getVersion"
                                       @change="()=>{form.module='';form.config='';getCase()}">
                                <el-option
                                        v-for="(item,index) in versionList"
                                        :label="item.version"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5" :offset="1">
                        <el-form-item label="模块" :label-width="formLabelWidth" prop="module">
                            <el-select v-model="form.module"
                                       clearable
                                       :disabled="form.version_id===''"
                                       @visible-change="getModule"
                                       @change="getCase">
                                <el-option
                                        v-for="(item,index) in moduleList"
                                        :label="item"
                                        :value="item"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5" :offset="1">
                        <el-form-item label="配置项" :label-width="formLabelWidth" prop="config">
                            <el-select v-model="form.config" filterable
                                       :disabled="form.project_id===''" @visible-change="getConfig">
                                <el-option
                                        v-for="(item,index) in configList"
                                        :label="item.cfg_name"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-form>
            </el-row>
            <el-row class="table-up">
                <el-col :span="11">
                    <el-form :inline="true" class="_bottom0 demo-form-inline _right" size="mini"  style="margin-bottom: 10px;">
                        <el-form-item>
                            <el-input v-model="source.name" placeholder="关键字" style="width: 120px"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="source.module"
                                       clearable
                                       :disabled="form.version_id===''"
                                       style="width: 120px"
                                       placeholder="模块"
                                       filterable
                                       @visible-change="getModule"
                                       @change="source.record_id=''">
                                <el-option
                                        v-for="(item,index) in moduleList"
                                        :label="item"
                                        :value="item"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="source.record_id"
                                       clearable
                                       :disabled="source.module===''"
                                       style="width: 120px"
                                       placeholder="接口"
                                       filterable
                                       @visible-change="getSInterface">
                                <el-option
                                        v-for="(item,index) in recordList"
                                        :label="item.name"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                          <el-input v-model="source.owner" placeholder="作者" style="width: 120px"></el-input>
                        </el-form-item>
                    </el-form>
                    <el-table :data="sourceShowList"
                              height="450" border class='_table sourceShowList table-up' header-cell-class-name="_table-head"
                              size="mini"
                              @select-all="sourceSelectAll"
                              @selection-change="sourceSelectionChange"
                              v-loadmore="sourceLoadMore">
                        <el-table-column type="selection"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="title" :render-header="renderSourceHeader"></el-table-column>
                    </el-table>
                </el-col>
                <el-col :span="2">
                    <div style="margin-left: 25%; margin-top: 200px">
                        <el-button type="primary" icon="el-icon-arrow-left" circle @click="targetToSource" :class="targetSelection.length=='0'?'leftOrRight':''"></el-button>
                    </div>
                    <br/>
                    <div style="margin-left: 25%">
                        <el-button type="primary" icon="el-icon-arrow-right" circle @click="sourceToTarget" :class="sourceSelection.length=='0'?'leftOrRight':''"></el-button>
                    </div>
                </el-col>
                <el-col :span="11">
                    <el-form :inline="true" class="_bottom0 demo-form-inline _right" size="mini"  style="margin-bottom: 10px;">
                        <el-form-item>
                            <el-input v-model="target.name" placeholder="关键字" style="width: 120px"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="target.module"
                                       clearable
                                       :disabled="form.version_id===''"
                                       style="width: 120px"
                                       placeholder="模块"
                                       filterable
                                       @visible-change="getModule"
                                       @change="target.record_id=''">
                                <el-option
                                        v-for="(item,index) in moduleList"
                                        :label="item"
                                        :value="item"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="target.record_id"
                                       clearable
                                       :disabled="target.module===''"
                                       style="width: 120px"
                                       placeholder="接口"
                                       filterable
                                       @visible-change="getTInterface">
                                <el-option
                                        v-for="(item,index) in recordList1"
                                        :label="item.name"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-input v-model="target.owner" placeholder="作者" style="width: 120px"></el-input>
                        </el-form-item>
                    </el-form>
                    <el-table :data="targetShowList"
                              height="450" border class='_table targetShowList table-up' header-cell-class-name="_table-head"
                              size="mini"
                              @select-all="targetSelectAll"
                              @selection-change="targetSelectionChange"
                              v-loadmore="targetLoadMore">
                        <el-table-column type="selection"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="title" :render-header="renderTargetHeader"></el-table-column>
                    </el-table>
                </el-col>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveTestSetManage">保 存</el-button>
            </div>
        </el-dialog>

        <el-dialog title="填写配置" :visible.sync="configVisible">
            <div style="text-align: center">
                <el-checkbox v-model="customConfig.setup" border>启用Setup&Teardown</el-checkbox>
                <el-checkbox v-model="customConfig.host" border>启用自定义配置</el-checkbox>
                <el-checkbox v-model="customConfig.loop" border>启用循环执行</el-checkbox>
                <el-checkbox v-model="customConfig.module" border>启用部分执行</el-checkbox>
                <hr style="height: 1px;border: none;background-color: #E6E6E6;" />
            </div>
            <div style="max-height: 520px;overflow: auto">
                <div v-show="customConfig.setup">
                    <el-tag class="_configTitle">Setup</el-tag>
                    <div style="margin-left: 60px">
                        <el-checkbox-group v-model="choosedSetup" size="small">
                            <el-checkbox v-for="(item,index) in setupList" :label="item.description" :key="index" border style="margin: 5px"></el-checkbox>
                        </el-checkbox-group>
                    </div>
                    <el-tag class="_configTitle">Teardown</el-tag>
                    <div style="margin-left: 60px">
                        <el-checkbox-group v-model="choosedTeardown" size="small">
                            <el-checkbox v-for="(item,index) in TeardownList" :label="item.description" :key="index" border style="margin: 5px"></el-checkbox>
                        </el-checkbox-group>
                    </div>
                    <hr style="height: 1px;border: none;background-color: #E6E6E6;" />
                </div>
                <div v-show="customConfig.host">
                    <el-tag class="_configTitle">自定义配置</el-tag>
                    <el-form :inline="true" class="_bottom0 demo-form-inline _configForm" ref="config_form" :rules="host_rules" :model="user_config">
                        <el-form-item label="请求协议">
                            <el-select v-model="user_config.protocol"
                                       size="small"
                                       style="width: 100px">
                                <el-option value="HTTP" key="HTTP" label="HTTP"></el-option>
                                <el-option value="HTTPS" key="HTTPS" label="HTTPS"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Host" prop="host">
                            <el-input v-model="user_config.host" size="small" placeholder="Host，格式为ip:port" title="Tips:当勾选多个测试集时，所有测试集均使用此Host" auto-complete="off"></el-input>
                        </el-form-item>
                        <el-form-item label="特征版本">
                            <el-input v-model="user_config.feature_version" size="small" placeholder="特征版本" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-form>
                    <hr style="height: 1px;border: none;background-color: #E6E6E6;margin-top: 24px;" />
                </div>
                <div v-show="customConfig.loop">
                    <el-tag class="_configTitle">循环策略</el-tag>
                    <el-form :inline="true" class="_bottom0 demo-form-inline _configForm" ref="loop_form" :rules="loop_rules" :model="loop_config">
                        <el-form-item label="循环次数" prop="loop_cnt">
                            <el-input v-model.number="loop_config.loop_cnt" size="small" placeholder="循环次数" auto-complete="off"></el-input>
                        </el-form-item>
                        <el-form-item label="间隔时间" prop="sleep_time">
                            <el-input v-model.number="loop_config.sleep_time" size="small" placeholder="间隔时间，单位为秒(s)" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-form>
                    <hr style="height: 1px;border: none;background-color: #E6E6E6;margin-top: 24px;" />
                </div>
                <div v-show="customConfig.module">
                    <el-tag class="_configTitle">部分执行</el-tag>
                    <el-form :inline="true" class="_bottom0 demo-form-inline _configForm">
                        <el-form-item label="模块">
                            <el-select v-model="runModule" size="small" multiple clearable>
                                <el-option v-for="(item,index) in moduleList1" :label="item" :value="item" :key="index"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <hr style="height: 1px;border: none;background-color: #E6E6E6;" />
                </div>
                <div>
                    <el-tag class="_configTitle">邮件发送至(请填写完整邮件地址，多个地址以英文逗号分隔)</el-tag>
                    <el-form class="_bottom0 demo-form-inline _configForm" label-position="left" ref="emailForm">
                        <el-form-item label="收件人" label-width="65px" :rules="[{required:runType == 2}]" >
                            <el-input v-model="email" size="small" placeholder="收件人邮箱地址" auto-complete="off"></el-input>
                        </el-form-item>
                        <el-form-item label="抄送" label-width="65px">
                            <el-input v-model="cc" size="small" placeholder="抄送人邮箱地址" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="configVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfig">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="测试集详情" :visible.sync="detailVisible">
            <div v-if="statusList[currentRow.id]===4">
                <el-tag type="danger" style="font-size: 18px">Trace Log</el-tag>
                <div style="margin: 0 10%; font-size: 18px">{{currentRow.tracelog}}</div>
            </div>
            <div v-else>
                <el-row>
                    <div class="_left" style="margin-top: 8px">
                        <span class="span-info">Total
                            <span style="font-size: 20px;margin-left: 2px">{{caseDetailList.total}}</span>
                        </span>
                        <span class="span-success" style="margin-left: 10px">Pass
                            <span style="font-size: 20px;margin-left: 2px">{{caseDetailList.pass}}</span>
                        </span>
                        <span class="span-danger" style="margin-left: 10px">Fail
                            <span style="font-size: 20px;margin-left: 2px">{{caseDetailList.fail}}</span>
                        </span>
                    </div>
                    <el-form :inline="true" class="_bottom0 demo-form-inline _right">
                        <el-form-item>
                            <el-input v-model="form2.case_name" size="mini" placeholder="请输入名称" clearable></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="form2.case_result" clearable size="mini" placeholder="请选择执行结果">
                                <el-option value="通过" label="通过"></el-option>
                                <el-option value="失败" label="失败"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" circle size='mini' @click="()=>{pageNum_S=1;getDetailByPage()}" icon="el-icon-search"></el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" size='mini' @click="getDetailByPage">刷 新</el-button>
                        </el-form-item>
                    </el-form>
                </el-row>
                <el-table :data="caseDetailList.programData" :row-class-name="tableRowClassName"
                          height="490" border class='_table' header-cell-class-name="_table-head">
                    <!--<el-table-column prop="id" label="id" width="55"></el-table-column>-->
                    <el-table-column type="index" label="序号" width="70"></el-table-column>
                    <el-table-column label="测试用例名称">
                        <template slot-scope='props'>
                            <span v-if="props.row.is_script===0">{{props.row.title}}</span>
                            <a v-if="props.row.is_script===1" class="link-in-table" @click="viewCodeOnline(props.row)">{{props.row.title}}</a>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="运行状态" width="100"></el-table-column>
                    <el-table-column label="日志" width="70">
                        <template slot-scope='props'>
                            <el-button type='text' @click='getCaseLog(props.row)' class="op-btm">查看</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column label="备注" width="70">
                        <template slot-scope='props'>
                            <el-button type='text' @click='remark(props.row)' class="op-btm">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="block">
                    <el-pagination @size-change="handleSizeChange_S" @current-change="handleCurrentChange_S" :current-page="pageNum_S"
                                   :page-sizes="[20, 50, 100]"
                                   :page-size="pageNums_S" layout="total, sizes, prev, pager, next, jumper"
                                   :total="caseDetailList.count">
                    </el-pagination>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="detailVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="日志" :visible.sync="caseLogVisible" width="45%">
            <div style="max-height: 500px; overflow:auto" class="caseLog">
                <el-collapse accordion style="max-width: 98%">
                    <template v-for="(item,index) in caseLog['steps']">
                        <div v-if="item.case" :key="index">
                            <div v-if="item.result == 'Fail'">
                                <span style="color: tomato; font-weight: bold">失败原因 : </span>
                                <span class="_caseStep">{{item.reason}}</span>
                            </div>
                            <div>
                                <span style="font-weight: bold">用例内容 : </span>
                                <span class="_caseStep">{{JSON.stringify(item.case)}}</span>
                            </div>
                        </div>
                        <el-collapse-item v-else :title="item.title" :key="index">
                            <div v-if="item.result == 'Fail'">
                                <span style="color: tomato; font-weight: bold">失败原因 : </span>
                                <span class="_caseStep" v-html="item.reason"></span>
                            </div>
                            <div v-if="item.link">
                                <span style="font-weight: bold">脚本日志: </span>
                                <a class="_caseStep link-in-table" @click="openLink(item.link)">{{item.link}}</a>
                            </div>
                            <div v-if="(item.title)&&(item.title.indexOf('Setup:') != -1)">
                                <span style="font-weight: bold">Steps : </span>
                                <span class="_caseStep">{{item.steps}}</span>
                            </div>
                            <div v-if="item.url">
                                <span style="font-weight: bold">URL : </span>
                                <span class="_caseStep">{{item.url}}</span>
                            </div>
                            <div v-if="item.req">
                                <span style="font-weight: bold">请求参数 : </span>
                                <span class="_caseStep">{{JSON.stringify(item.req)}}</span>
                            </div>
                            <div v-if="item.rsp">
                                <span style="font-weight: bold">响应结果 : </span>
                                <span class="_caseStep">{{JSON.stringify(item.rsp)}}</span>
                            </div>
                            <div v-if="item.expect">
                                <span style="font-weight: bold">预期结果 : </span>
                                <span class="_caseStep">{{JSON.stringify(item.expect)}}</span>
                            </div>
                        </el-collapse-item>
                    </template>
                </el-collapse>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" @click="caseLogVisible = false">确 定</el-button>
            </div>
        </el-dialog>
        
        <el-dialog title="备注" :visible.sync="remarkVisible" width="30%">
            <span>{{caseRemark.title}}</span>
            <el-input v-model="caseRemark.remark" type="textarea" style="overflow: auto;" key="remark" :autosize="{ minRows: 2, maxRows: 8 }"></el-input>
            <div slot="footer" class="dialog-footer">
                <el-button @click="remarkVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitRemark">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="报告列表" :visible.sync="reportVisible">
            <el-table :data="reportList.programData"
                      height="500" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column prop="id" label="id" width="55"></el-table-column>-->
                <el-table-column label="报告名称">
                    <template slot-scope='props'>
                        <a class="link-in-table" @click="getReportPath(props.row)">{{props.row.title}}</a>
                        <el-tag v-if="(pageNum_R === 1)&&(props.$index === 0)" type="danger">最新</el-tag>
                        <el-tag v-if="props.row.release" type="warning">Release</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="pass_count" label="成功数" width="100"></el-table-column>
                <el-table-column prop="fail_count" label="失败数" width="100"></el-table-column>
                <el-table-column prop="created_time" label="创建时间" width="170" :formatter="timeFormat"></el-table-column>
            </el-table>
            <div class="block">
                <el-pagination @size-change="handleSizeChange_R" @current-change="handleCurrentChange_R" :current-page="pageNum_R"
                               :page-sizes="[10, 20, 50]"
                               :page-size="pageNums_R" layout="total, sizes, prev, pager, next, jumper"
                               :total="reportList.count">
                </el-pagination>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="reportVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="克隆测试集" :visible.sync="cloneVisible" width="40%">
            <el-input v-model.trim="cloneName">
              <span slot="prepend">新测试集名称</span>
            </el-input>
            <div slot="footer" class="dialog-footer">
              <el-button @click="cloneVisible = false">取 消</el-button>
              <el-button type="primary" @click="submitClone">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    import AdvanceFilter from "../../components/AdvanceFilter/index";
    import TableOperator from "../../components/TableOperator/index";
    import { Nginx, FilterProject, FilterVersion, FilterModule, FilterRecord, FilterCaseType, FilterConfig } from '@/common/index';
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { getCaseList, remarkCase, getInterfaceList, getCaseTypeList } from '@/api/case';
    import { getConfigList } from '@/api/config';
    import { getTestsetList, createTestset, updateTestset, deleteTestset, deleteTestsetBatch, cloneTestSet } from '@/api/testset';
    import { getProgress, getTestsetDetail, getTestsetLog, getTestsetReport, getTestsetReportHistory } from '@/api/testset';
    import { runTestset, mockTestset, rerunTestset, stopTestset, getSetup, getSetModule } from '@/api/testset';
    import { getTestsetLock, setTestsetLock } from '@/api/testset';
    import { openFile } from '@/api/others';
    import moment from 'moment' //引入moment化简时间
    const rootPath = process.env.BASE_API;

    export default {
        name: 'testsetList',
        components: {TableOperator, AdvanceFilter},
        data() {
            var validateHost = (rule,value,callback)=>{
                var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
                if( value!==''&&!reg.test(value) ){
                    callback(new Error('Host格式不正确'))
                }else {
                    callback();
                }
            };
            return {
                intervalId: true,
                showFilter: true,
                form: {
                    id: 0,
                    title: '',
                    project_id: '',
                    version_id: '',
                    module: '',
                    case_ids: [],
                    type: 1,
                    config: '',
                },
                form2: {
                    type: '',
                    project_id: '',
                    version_id: '',
                    case_name: '',
                    case_result: '',
                    title:'',
                    config:'',
                    run_status:'',
                    modifier:'',
                    id: '',
                    viewMyTask: false
                },
                caseDetailList: {
                    page_no: 1,  //页面开始页码
                    page_size: 20,  //每页条数
                    count: 0,  //总数目，已执行用例总数
                    pass: 0, //通过数目
                    total: 0, //用例总数目
                    fail:0,  //失败数目
                    programData: [], //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                source:{name: '',module: '',record_id: '',owner: '',caseList: [],num: 20},
                target:{name: '',module: '',record_id: '',owner: '',caseList: [],num: 20},
                email: '',
                cc: '',
                loop_config:{
                    loop_cnt: '',
                    sleep_time: '',
                },
                user_config: {
                    protocol:'HTTP',
                    host :'',
                    feature_version:'',
                },
                runModule: [],
                runType: 0,
                currentRow: {},
                statusList: {},
                progressList: {},
                testSetList: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [], //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                projectList: [],
                versionList: [],
                moduleList: [],
                moduleList1: [],
                recordList: [],
                recordList1: [],
                configList: [],
                caseTypeList: [],
                choosedSetlist: [],
                caseLog: [],
                formLabelWidth: '100px',
                pageNums: 10,//每页几条
                pageNum: 1, //当前是第几页
                pageNums_S: 20,//每页几条
                pageNum_S: 1, //当前是第几页
                pageNums_R: 10,//每页几条
                pageNum_R: 1, //当前是第几页
                dialogFormVisible: false,
                detailVisible: false,
                configVisible: false,
                caseLogVisible: false,
                remarkVisible: false,
                editDisable: false,
                reportVisible: false,
                cloneVisible: false,
                formRule:{
                    title: [
                        { required: true, message: '请填写测试集名称', trigger: 'blur' }
                    ],
                    project_id: [
                        { required: true, message: '请选择项目', trigger: 'change' }
                    ],
                    version_id: [
                        { required: true, message: '请选择版本', trigger: 'change' }
                    ],
                    type: [
                        { required: true, message: '请选择测试类型', trigger: 'change' }
                    ],
                    config: [
                        { required: true, message: '请选择配置项', trigger: 'change' }
                    ]
                },
                setupList:[],
                TeardownList:[],
                choosedSetup: [],
                choosedTeardown:[],
                sourceSelection: [],
                targetSelection: [],
                sourceTmp: [],
                targetTmp: [],
                caseRemark: {
                    id: '',
                    title: '',
                    remark: ''
                },
                reportList: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [], //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                customConfig:{
                    setup: false,
                    host: false,
                    loop: false,
                    module: false
                },
                cloneName: '',
                loop_rules: {
                    loop_cnt:[
                        {type:'number',min:1,message:'循环次数必须为大于零的数字',trigger:'blur'}
                    ],
                    sleep_time:[
                        {type:'number',min:1,message:'间隔时间必须为大于零的数字',trigger:'blur'}
                    ]
                },
                host_rules:{
                    host:[
                        {validator:validateHost, trigger:'blur'}
                    ]
                },
                operateArray: [
                    {label:'执行', click:this.handleRunSet, dropdown:true,
                        disable: (row)=>{return [2,5,6].includes(this.statusList[row.id])},
                        dropList:[
                            {label:'正常执行', command:1},
                            {label:'失败重试', command:2},
                            {label:'模拟执行', command:3},
                        ]
                    },
                    {label:'停止', type:"danger", click:this.handleStopRun, dropdown:true,
                        disable: (row)=>{return ![2,5,6].includes(this.statusList[row.id])},
                        dropList:[
                            {label:'等待停止', command:1},
                            {label:'立即停止', command:2},
                        ]
                    },
                    {label:'报告', click:this.getReport},
                    {label:'执行详情', click:this.details},
                    {label:'编辑', click:this.updateSelf1},
                    {label:'克隆', click:this.cloneSelf1},
                ],
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject,
                        change:()=>{this.form2.version_id=''; this.form2.config=''}},
                    {key:'version_id',name:'版本',type:'select',optionList:[],visible: this.getFilterVersion,
                        disable:()=>{return this.form2.project_id===''}},
                    {key:'id',name:'ID',type:'input'},
                    {key:'title',name:'测试集名称',type:'input'},
                    {key:'type',name:'用例类型',type:'select',optionList:[],visible: this.getFilterCaseType},
                    {key:'run_status',name:'运行状态',type:'select',optionList:[
                            {label:"待执行", value:'0'},
                            {label:"已完成", value:'1'},
                            {label:"执行中", value:'2'},
                            {label:"已停止", value:'3'},
                            {label:"执行异常", value:'4'},
                            {label:"正在执行Setup", value:'5'},
                            {label:"正在执行TearDown", value:'6'},
                        ]
                    },
                    {key:'config',name:'配置项',type:'select',optionList:[],visible: this.getFilterConfig,
                        disable:()=>{return this.form2.project_id===''}},
                    {key:'modifier',name:'修改人',type:'input'},
                ],
            }
        },

        computed:{
            ...mapGetters(["name"]),
            sourceShowList: function(){
                let name = this.source.name.toLowerCase();
                let module = this.source.module;
                let record = this.source.record_id;
                let owner = this.source.owner.toLowerCase();
                let num = this.source.num;
                this.sourceSelection = [];
                this.sourceTmp = this.source.caseList.filter(function(item){
                    return(
                        (name==="" || item.title.toLowerCase().indexOf(name)>-1)
                        && (module==="" || item.module===module)
                        && (record==="" || item.record_id===record)
                        && (owner==="" || item.owner.toLowerCase().indexOf(owner)>-1)
                    )
                })
                return this.sourceTmp.slice(0,num)
            },
            targetShowList: function(){
                let name = this.target.name.toLowerCase();
                let module = this.target.module;
                let record = this.target.record_id;
                let owner = this.target.owner.toLowerCase();
                let num = this.target.num;
                this.targetSelection = [];
                this.targetTmp = this.target.caseList.filter(function(item){
                    return(
                        (name==="" || item.title.toLowerCase().indexOf(name)>-1)
                        && (module==="" || item.module===module)
                        && (record==="" || item.record_id===record)
                        && (owner==="" || item.owner.toLowerCase().indexOf(owner)>-1)
                    )
                })
                return this.targetTmp.slice(0,num)
            }
        },

        directives:{
            loadmore: {
                // 指令的定义
                bind: function (el,binding) {
                    // 获取element-ui定义好的scroll盒子
                    const TABLEWRAP_DOM = el.querySelector('.el-table__body-wrapper');
                    TABLEWRAP_DOM.addEventListener('scroll', function() {
                        /*
                         * scrollHeight 获取元素内容高度(只读)
                         * scrollTop 获取或者设置元素的偏移值,常用于计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
                         * clientHeight 读取元素的可见高度(只读)
                         * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
                         * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
                         */
                        if(this.scrollHeight - this.scrollTop === this.clientHeight){
                            binding.value(this.scrollTop);
                        }
                    })
                }
            }
        },
        
        mounted() {
            this.initList();
            this.getProject();
            this.getCaseType();
            this.intervalId = setInterval(() => {
                this.getTestsetProgress();
            }, 5000)
        },

        beforeDestroy() {
            clearInterval(this.intervalId)
        },
        methods: {
            initList() {
                let self = this;
                getTestsetList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    type: this.form2.type,
                    project_id: this.form2.project_id,
                    version_id: this.form2.version_id,
                    title: this.form2.title,
                    config: this.form2.config,
                    run_status: this.form2.run_status,
                    modifier: this.form2.modifier,
                    id: this.form2.id,
                    owner:this.form2.viewMyTask?this.name:"",
                }).then(function(response){
                    console.log(response)
                    self.testSetList = {
                        page_no: self.pageNum,
                        page_size: 10 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.sets
                    }
                    self.getTestsetProgress();
                })
            },
            getTestsetProgress(){
                let list = [];
              this.testSetList.programData && this.testSetList.programData.forEach(function(item) {
                    list.push(item.id);
                })
                if(list.length === 0){
                    return
                }
                let self = this;
                getProgress({set_id: list}).then(function (response) {
                    // console.log(response)
                    for(var key in response.data){
                        var set = response.data[key];
                        self.$set(self.progressList, key, {
                            percent: 0,
                            case_id: set.case_id,
                            duration: set.duration,
                            start_time: set.start_time,
                            end_time: set.end_time
                        });
                        if(set.code == 0){
                            if(set.status==2){
                                let tmp = (set.progress * 100).toFixed(2);
                                self.progressList[key].percent = parseFloat(tmp);
                            }
                            self.$set(self.statusList, key, set.status);
                        }
                        else{
                            self.$set(self.statusList, key, set.msg);
                        }
                    }
                })
            },
            getDetailByPage(){
                let ref = this;
                getTestsetDetail(ref.currentRow.id, {
                    page_no: this.pageNum_S,
                    page_size: this.pageNums_S,
                    title: this.form2.case_name,
                    status: this.form2.case_result,
                }).then(function(response){
                    if(response.data.code === 0) {
                        ref.caseDetailList = {
                            page_no: ref.pageNum_S,
                            page_size: 20 || ref.pageNums_S,
                            count: response.data.total,
                            pass: response.data.pass,
                            fail: response.data.fail,
                            total: response.data.totalNum,
                            programData: response.data.cases
                        }
                    }
                    else{
                        ref.$message.error(response.data.msg)
                    }
                })
            },
            details(self) {
                this.pageNums_S = 20;
                this.pageNum_S = 1;
                this.currentRow = self;
                this.form2.case_name = '';
                this.form2.case_result = '';
                this.caseDetailList = {
                    count: 0,
                    pass: 0,
                    total: 0,
                    fail:0,
                    programData: [],
                }
                this.getDetailByPage();
                this.detailVisible = true;
            },
            getCaseLog(self){
                let ref = this;
                getTestsetLog(ref.currentRow.id, self.id).then(function(response){
                    if(response.data.code === 0){
                        ref.caseLog = response.data.result;
                        ref.caseLogVisible = true;
                    }
                    if(response.data.code === 3){
                        ref.$notify.error(response.data.msg);
                    }
                })
            },
            remark(self){
                this.caseRemark = {
                    id: self.id,
                    title: self.title,
                    remark: self.remark
                };
                this.remarkVisible = true;
            },
            submitRemark(){
                let self = this;
                remarkCase(this.caseRemark).then((response)=>{
                    console.log(response)
                    if(response.data.code !== 0){
                        self.$message.error(response.data.msg);
                    }
                    else{
                        self.remarkVisible = false;
                        self.getDetailByPage();
                    }
                })
            },
            addTestSet(){
                this.dialogFormVisible = true;
                this.editDisable = false;
                this.resetForm();
            },
            updateSelf1(self){
                this.currentRow = self;
                let ref = this;
                getTestsetLock(self.id).then(function (response) {
                    if(response.data.code === 0){
                        switch(response.data.lock_status){
                            case 0:
                                ref.getNewestSet(self.id).then(function (result) {
                                    if(result){
                                        ref.getVersion(true);
                                        ref.getConfig(true);
                                        ref.getSetCase();
                                        ref.editDisable = true;
                                        ref.dialogFormVisible = true;
                                        setTestsetLock(self.id, {lock_status: 1});
                                    }
                                });
                                break;
                            case 1:
                                ref.$message.error("此测试集正在被"+response.data.editor+"编辑！");
                                break;
                            default:
                                console.log("lock_status error")
                        }
                    }
                    else{
                        ref.$message.error(response.data.msg)
                    }
                })
            },
            async getNewestSet(set_id) {
                this.resetForm();
                let self = this;
                let result = true;
                await getTestsetList({id: set_id}).then(function (response) {
                    if (response.data.code !== 0){
                        self.$message.error(response.data.msg);
                        result = false;
                    }
                    else if(response.data.sets.length === 0) {
                        self.$message.error("此测试集已不存在，请刷新页面！");
                        result = false;
                    }
                    else {
                        let data = response.data.sets[0];
                        self.form = {
                            id: data.id,
                            title: data.title,
                            project_id: data.project_id,
                            version_id: data.version_id,
                            module: data.module,
                            case_ids: [],
                            type: data.type,
                            config: data.config
                        }
                    }
                })
                return result;
            },
            getSetCase(){
                let self = this;
                let crt = this.currentRow;
                let targettmp = [];
                getCaseList({
                    id_title: true,
                    project_id: crt.project_id,
                    type: crt.type
                }).then(function (response) {
                    let case_ids = [].concat(crt.case_ids).reverse();
                    let cases = response.data.cases;
                    case_ids.forEach(function(id){
                        let tmp = cases.findIndex((item)=>{
                            return item.id === id;
                        });
                        if(tmp !== -1){
                            targettmp.push(cases[tmp]);
                            cases.splice(tmp,1);
                        }
                    })
                    self.source = {name: '',module: '',record_id: '',owner: '',caseList: [],num: 20};
                    self.target = {name: '',module: '',record_id: '',owner: '',caseList: [],num: 20};
                    self.source.caseList = cases;
                    self.target.caseList = targettmp;
                }).catch(function (err) {
                });
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteTestset(self.id).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！");
                            ref.initList();
                        }
                        else {
                            ref.$message.error(response.data.msg)
                        }
                    }).catch(function (err) {
                    });
                }).catch(() => {})
            },
            cloneSelf1(self){
                this.currentRow = self;
                this.cloneVisible = true;
            },
            submitClone(){
              if(this.cloneName === ''){
                this.$notify.error("测试集名称不可以为空！");
                return false;
              }
              let ref = this;
              cloneTestSet(ref.currentRow.id,ref.cloneName).then(function (response) {
                console.log(response)
                if(response.data.code === 0){
                  ref.$message.success("克隆成功！");
                  ref.cloneVisible = false;
                  ref.cloneName = '';
                  ref.initList();
                }
                else{
                  ref.$message.error(response.data.msg);
                }
              })
            },
            getReport(self){
                this.currentRow = self;
                this.pageNums_R = 10;
                this.pageNum_R = 1;
                this.getReportHistory(self.id)
            },
            getReportHistory(id){
                let ref = this;
                getTestsetReportHistory(id, {
                    page_no: ref.pageNum_R,
                    page_size: ref.pageNums_R
                }).then(function (response) {
                    if(response.data.code === 0){
                        ref.reportList = {
                            page_no: ref.pageNum_R,
                            page_size: 20 || ref.pageNums_R,
                            count: response.data.total,
                            programData: response.data.reports
                        }
                        ref.reportVisible = true;
                    }
                    else{
                        ref.$message.error(response.data.msg)
                    }
                })
            },
            openLink(link){
                let self = this;
                openFile(link).then(function(response){
                    if(response.data.code === 3){
                        self.$message.error(response.data.msg);
                    }
                    else{
                        window.open(link);
                    }
                })
            },
            getReportPath(self) {
                let url = rootPath + '/common/report/' + self.report_path;
                this.openLink(url);
            },
            viewCodeOnline(self){
                window.open("/static/codeOnline.html?id="+self.id, rootPath)
            },
            delTestSetBatch(){
                let set_ids = this.getIdFromList(this.choosedSetlist);
                if(set_ids.length === 0){
                    this.$message.error("请至少选择一个测试集！");
                    return
                }
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '批量删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteTestsetBatch({set_ids:set_ids}).then(function (response) {
                        console.log(response)
                        ref.$message.info(response.data.msg);
                        ref.initList();
                    }).catch(function (err) {
                    });
                }).catch(() => {})
            },
            handleRunSet(val, self){
                this.currentRow = self;
                if(val === 3){
                    this.runSetMock();
                }
                else{
                    this.resetForm();
                    this.getSetup();
                    this.getRunModule();
                    this.configVisible = true;
                    this.runType = val;
                }
            },
            handleStopRun(val, self){
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '停止执行', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    stopTestset({
                        set_id: [self.id],
                        choice: val
                    }).then(function (response) {
                        console.log(response.data)
                        if(response.data.code === 0){
                            ref.$message.success(response.data.msg);
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
                    .catch(function (err) {
                    });
                }).catch(() => {})
            },
            handleConfig(){
                var isValid = true
                if(this.user_config.host!==''){
                    this.$refs['config_form'].validate((valid) => {
                        if (!valid) {
                            isValid = false
                            return false;
                        }
                    });
                }
                if(this.customConfig.loop){
                    this.$refs['loop_form'].validate((valid)=>{
                        if(!valid){
                            isValid = false;
                            return false;
                        }
                    })
                }
                if (isValid){
                    switch(this.runType){
                        case 1:
                            this.runSet();
                            break;
                        case 2:
                            if(this.email===''){
                                this.$message.error("失败重试必须填写收件人！");
                                return;
                            }
                            this.runSetAgain();
                            break;
                        default:
                            break;
                    }
                    this.configVisible = false;
                }
            },
            checkUserConfig(){
                for(var key in this.user_config){
                    if(this.user_config[key] === ""){
                        delete this.user_config[key]
                    }
                }
            },
            runSet() {
                let ref = this;
                let emailList = ref.email.split(",");
                let ccList = ref.cc.split(",");
                this.checkUserConfig();
                runTestset({
                    set_id: [this.currentRow.id],
                    email: ref.email == "" ? [] : emailList,
                    cc: ref.cc == "" ? [] : ccList,
                    setup: ref.customConfig.setup ? ref.convertSetupMap() : {},
                    teardown: ref.customConfig.setup ? ref.convertTeardownMap() : {},
                    loop_cnt: ref.customConfig.loop ? ref.loop_config.loop_cnt : '',
                    sleep_time: ref.customConfig.loop ? ref.loop_config.sleep_time : '',
                    user_config: ref.customConfig.host ? ref.user_config : {},
                    module: ref.customConfig.module ? ref.runModule : []
                }).then(function (response) {
                    console.log(response.data)
                    if(response.data.code === 0){
                        ref.$message.success("后台正在执行,请查看进度或详情！");
                        ref.getTestsetProgress();
                    }
                    else {
                        ref.$message.error(response.data.msg);
                    }
                })
                .catch(function (err) {
                });
            },
            runSetMock() {
                let ref = this;
                mockTestset({
                    set_id: [this.currentRow.id]
                }).then(function (response) {
                    console.log(response.data)
                    if(response.data.code === 0){
                        ref.$message.success("后台正在执行,请查看进度或详情！");
                    }
                    else {
                        ref.$message.error(response.data.msg);
                    }
                })
                .catch(function (err) {
                });
            },
            runSetAgain() {
                let ref = this;
                let emailList = ref.email.split(",");
                let ccList = ref.cc.split(",");
                this.checkUserConfig();
                rerunTestset({
                    set_id: [this.currentRow.id],
                    email: ref.email == "" ? [] :emailList,
                    cc: ref.cc == "" ? [] : ccList,
                    setup: ref.customConfig.setup ? ref.convertSetupMap() : {},
                    teardown: ref.customConfig.setup ? ref.convertTeardownMap() : {},
                    loop_cnt: ref.customConfig.loop ? ref.loop_config.loop_cnt : '',
                    sleep_time: ref.customConfig.loop ? ref.loop_config.sleep_time : '',
                    user_config: ref.customConfig.host ? ref.user_config : {},
                    module: ref.customConfig.module ? ref.runModule : []
                }).then(function (response) {
                    console.log(response.data)
                    if(response.data.code === 0){
                        ref.$message.success("后台正在执行,请查看进度或详情！");
                        ref.getTestsetProgress();
                    }
                    else {
                        ref.$message.error(response.data.msg);
                    }
                }).catch(function (err) {
                });
            },
            saveTestSetManage() {
                let ref = this;
                if (ref.validateFormRule('form') && ref.checkChooseCase()) {
                    // id大于0为编辑，小于等于0为新增
                    if(ref.form.id > 0){
                        updateTestset(ref.form.id, ref.form).then(function (response) {
                            console.log(response)
                            if (response.data.code === 0) {
                                ref.$message.success("保存成功！");
                                ref.initList();
                                ref.dialogFormVisible = false;
                            }
                            else {
                                ref.$message.error(response.data.msg);
                            }
                        })
                    }
                    else {
                        createTestset(ref.form).then(function (response) {
                            console.log(response)
                            if (response.data.code === 0) {
                                ref.$message.success("保存成功！");
                                ref.initList();
                                ref.dialogFormVisible = false;
                            }
                            else {
                                ref.$message.error(response.data.msg);
                            }
                        })
                    }
                }
                else{
                    return false;
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
            seachCondition() {
                this.pageNum = 1;
                this.initList();
            },
            timeFormat(row,column){
                if (row.created_time === undefined || row.created_time === null) {
                    return "无";
                }
                return moment(row.created_time).format("YYYY-MM-DD HH:mm:ss");
            },
            dateFormat(date) {
                if (date === undefined || date === null) {
                    return "无";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            strFormat(str) {
                if (str === undefined || str === null) {
                    return "无";
                }
                return str.toString();
            },
            statusTagType(status){
                switch(status){
                    case 0:
                        return "warning";
                    case 3:
                        return "info";
                    case 4:
                        return "danger";
                    default:
                        return "success";
                }
            },
            statusTagFormat(status){
                switch(status){
                    case 0:
                        return "待执行";
                    case 1:
                        return "已完成";
                    case 3:
                        return "已停止";
                    case 4:
                        return "执行异常";
                    case 5:
                        return "正在执行Setup";
                    case 6:
                        return "正在执行TearDown";
                    default:
                        return status;
                }
            },
            typeFormat(row, column){
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
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getCaseType(){
                let self = this;
                getCaseTypeList().then(function (response){
                    console.log(response)
                    self.caseTypeList = response.data.types;
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                let self = this;
                if(flag == true){
                    getVersionList({project_id: self.form.project_id}).then(function (response) {
                        console.log(response)
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getConfig(flag){
                let self = this;
                if(flag == true){
                    getConfigList({
                        project_id: self.form.project_id,
                        version_id: self.form.version_id,
                        module: self.form.module,
                    }).then(function (response) {
                        console.log(response)
                        self.configList = response.data.keys;
                    }).catch(function (err) {
                    });
                }
            },
            getModule(flag){
                if(flag === true) {
                    let self = this;
                    getModuleList({
                        project_id: self.form.project_id,
                        version_id: self.form.version_id
                    }).then(function (response) {
                        console.log(response)
                        self.moduleList = response.data.module;
                    });
                }
            },
            getRunModule(){
                let self = this;
                getSetModule(this.currentRow.id).then(function (response) {
                    console.log(response)
                    if(response.data.code === 0) {
                        self.moduleList1 = response.data.modules;
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                }).catch(function (err) {
                });
            },
            getFilterProject(item){
                FilterProject(item)
            },
            getFilterVersion(item){
                FilterVersion(item, this.form2)
            },
            getFilterModule(item){
                FilterModule(item, this.form2)
            },
            getFilterRecord(item){
                FilterRecord(item, this.form2)
            },
            getFilterCaseType(item){
                FilterCaseType(item)
            },
            getFilterConfig(item){
                FilterConfig(item, this.form2)
            },
            getSInterface(flag){
                if(flag === true){
                    let self = this;
                    getInterfaceList({
                        project_id: self.form.project_id,
                        version_id: self.form.version_id,
                        module: self.source.module
                    }).then(function (response) {
                        console.log(response)
                        self.recordList = response.data.api_records;
                    }).catch(function (err) {
                    });
                }
            },
            getTInterface(flag){
                if(flag === true){
                    let self = this;
                    getInterfaceList({
                        project_id: self.form.project_id,
                        version_id: self.form.version_id,
                        module: self.target.module
                    }).then(function (response) {
                        console.log(response)
                        self.recordList1 = response.data.api_records;
                    }).catch(function (err) {
                    });
                }
            },
            getSetup(){
                let self = this;
                getSetup({config_id: this.currentRow.config}).then(function(response){
                    console.log(response)
                    if(response.data.code === 0) {
                        self.setupList = response.data.setup
                        self.TeardownList = response.data.teardown
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                })
            },
            convertSetupMap(){
                if(this.choosedSetup.length === 0){
                    return {};
                }
                let map = {};
                let self = this;
                this.setupList.forEach(function(item){
                    if(self.choosedSetup.indexOf(item.description) !== -1){
                        map[item.name] = true;
                    }
                    else{
                        map[item.name] = false;
                    }
                })
                return map;
            },
            convertTeardownMap(){
                if(this.choosedTeardown.length === 0){
                    return {};
                }
                let map = {};
                let self = this;
                this.TeardownList.forEach(function(item){
                    if(self.choosedTeardown.indexOf(item.description) !== -1){
                        map[item.name] = true;
                    }
                    else{
                        map[item.name] = false;
                    }
                })
                return map;
            },
            getCase(){
                let self = this;
                getCaseList({
                    id_title: true,
                    version_id: this.form.version_id,
                    project_id: this.form.project_id,
                    module: this.form.module,
                    type: this.form.type,
                }).then(function (response) {
                    console.log(response)
                    let cases = response.data.cases;
                    if(self.target.caseList.length > 0){
                        self.source.caseList = cases.filter((item)=>{
                            for(let target of self.target.caseList){
                                if(target.id === item.id){
                                    return false;
                                }
                            }
                            return true;
                        });
                    }
                    else{
                        self.source.caseList = cases;
                    }
                }).catch(function (err) {
                });
            },
            sourceLoadMore(scrollPosition){
                let tmp = this.sourceTmp.length - this.sourceShowList.length;
                let step = (tmp > 20) ? 20 : tmp;
                this.source.num += step;
                if(step > 0){
                    this.$nextTick(()=>{
                        this.$nextTick(()=> {
                            this.$nextTick(() => {
                                document.querySelector(".sourceShowList .el-table__body-wrapper").scrollTop = scrollPosition;
                            })
                        })
                    })
                }
            },
            sourceSelectAll(val){
                if (val.length === 0) {
                    return;
                }
                if((this.source.name === '') && (this.source.module === '') && (this.source.owner === '')){
                    this.sourceSelection = this.source.caseList;
                }
                else{
                    this.sourceSelection = this.sourceTmp;
                }
            },
            sourceSelectionChange(val){
                this.sourceSelection = val;
            },
            sourceToTarget(){
                this.source.caseList = this.source.caseList.filter((item)=>{
                    for(let select of this.sourceSelection){
                        if(select.id === item.id){
                            return false;
                        }
                    }
                    return true;
                });
                this.target.caseList = this.sourceSelection.concat(this.target.caseList);
            },
            targetLoadMore(scrollPosition){
                let tmp = this.targetTmp.length - this.targetShowList.length;
                let step = (tmp > 20) ? 20 : tmp;
                this.target.num += step;
                if(step > 0) {
                    this.$nextTick(() => {
                        this.$nextTick(() => {
                            this.$nextTick(() => {
                                document.querySelector(".targetShowList .el-table__body-wrapper").scrollTop = scrollPosition;
                            })
                        })
                    })
                }
            },
            targetSelectAll(val){
                if(val.length === 0){
                    return
                }
                if((this.target.name === '') && (this.target.module === '') && (this.target.owner === '')){
                    this.targetSelection = this.target.caseList;
                }
                else{
                    this.targetSelection = this.targetTmp;
                }
            },
            targetSelectionChange(val){
                this.targetSelection = val;
            },
            targetToSource(){
                this.target.caseList = this.target.caseList.filter((item)=>{
                    for(let select of this.targetSelection){
                        if(select.id === item.id){
                            return false;
                        }
                    }
                    return true;
                });
                this.source.caseList = this.targetSelection.concat(this.source.caseList);
            },
            checkChooseCase(){
                if(this.target.caseList.length === 0){
                    this.$notify.error("请至少选择一个测试用例！");
                    return false;
                }
                let tmp = this.getIdFromList(this.target.caseList);
                this.form.case_ids = tmp.reverse();
                return true;
            },
            handleSetSelectionChange(val){
                this.choosedSetlist = val;
            },
            tableRowClassName({row, rowIndex}){
                if (row.title == '用例不存在') {
                    return 'warning-row';
                }
                return '';
            },
            getIdFromList(list){
                let tmp = [];
                list.forEach(function(item){
                    tmp.push(item.id)
                })
                return tmp;
            },
            handleSizeChange(val) {
                this.pageNums = val;
                this.pageNum = 1;
                this.initList();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.initList();
            },
            handleSizeChange_S(val) {
                this.pageNums_S = val;
                this.pageNum_S = 1;
                this.getDetailByPage();
            },
            handleCurrentChange_S(val) {//改变页码
                this.pageNum_S = val;
                this.getDetailByPage();
            },
            handleSizeChange_R(val) {
                this.pageNums_R = val;
                this.pageNum_R = 1;
                this.getReportHistory(this.currentRow.id);
            },
            handleCurrentChange_R(val) {//改变页码
                this.pageNum_R = val;
                this.getReportHistory(this.currentRow.id);
            },
            closeEdit(){
                if(this.editDisable) {
                    setTestsetLock(this.currentRow.id, {lock_status: 0});
                }
            },
            timeoutClose(){
                if(this.editDisable){
                    setTimeout(() => {
                        this.$message.warning("Tips: 10分钟内未提交，将退出编辑");
                    }, 1000)
                    setTimeout(() => {
                        this.dialogFormVisible = false;
                        this.initList();
                    }, 600000)
                }
            },
            resetForm(){
                if(this.$refs["form"] != undefined) {
                    this.$refs["form"].resetFields();
                    this.form = {
                        id: 0,
                        title: '',
                        project_id: '',
                        version_id: '',
                        module: '',
                        case_ids: [],
                        type: 1,
                        config: ''
                    };
                }
                this.source = {name: '',module: '',record_id: '',owner: '',caseList: [],num: 20};
                this.target = {name: '',module: '',record_id: '',owner: '',caseList: [],num: 20};
                this.setupList = [];
                this.TeardownList = [];
                this.choosedSetup = [];
                this.choosedTeardown = [];
                this.user_config = {host :'',feature_version:'',protocol:'HTTP'};
                this.loop_config = {loop_cnt:'',sleep_time:''}
                this.runModule = [];
                this.customConfig = {
                    setup: false,
                    host: false,
                    loop: false,
                    module: false
                }
            },
            renderSourceHeader(h, { column, $index }){
                return h('span', [
                        h('span', "测试用例标题（未选择）"),
                        h('span', {style: "float: right"}, this.sourceSelection.length + "/" + this.sourceTmp.length),
                    ],
                )
            },
            renderTargetHeader(h, { column, $index }){
                return h('span', [
                        h('span', "测试用例标题（已选择）"),
                        h('span', {style: "float: right"}, this.targetSelection.length + "/" + this.targetTmp.length),
                    ],
                )
            },
            viewTask(){
                this.pageNum = 1;
                this.initList();
            },
        },
    }
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

    .el-table .warning-row {
        background: MistyRose;
    }

    .block {
        float: left;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }

    ._caseStep{
        display:block;
        line-height: 20px;
        word-break: break-all;
        word-wrap: break-word;
        text-indent:4em;
    }

    ._configTitle{
        font-size: 16px;
        margin: 10px 0;
    }

    ._configForm{
        margin-left: 60px;
        width: 85%;
    }

    .link-in-table{
        color: #0066cc;
        text-decoration: none;
    }

    .link-in-table:hover{
        color: #008489;
        text-decoration: underline;
    }

    .table-text{
        font-size: 13px;
    }

    .table-up{
        margin-top: 5px;
    }

    .mine-checkbox {
        margin-left: 10px;
        padding: 6px 8px;
        border: 1px solid #bccfcd;
    }

    .op-btm {
        text-decoration:underline;
    }
</style>
<style>
    .caseLog .el-collapse-item__header{
        height: inherit;
    }
</style>
