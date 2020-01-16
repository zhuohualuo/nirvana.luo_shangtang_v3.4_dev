export default {
  route: {
    home: 'Home',
    releaseNote: 'Release Notes',
    common: 'Common Resource',
    testService: 'Test Service',
    autoTest: 'Function Test',
    precision: 'Algorithm evaluation',
    projectManage: 'Project Management',
    projectList: 'Project',
    projectVersion: 'Version',
    moduleList: 'Module',
    caseManage: 'Test Case Item',
    createInterface: 'Create Interface',
    SwaggerUpload:'Import Swagger',
    updateInterface: 'Update Interface',
    interfaceList: 'Interface List',
    createCase: 'Create Case',
    updateCase: 'Update Case',
    caseList: 'Test Case',
    batchReplace: 'Use Case Batch Modification',
    uploadCase: 'Import Case',
    createTemplate: 'Create Template',
    templateCaseList: 'Case of Template',
    templateList: 'Template',
    caseType: 'Case Type',
    testset: 'Test Set',
    testPlan: 'Test Plan',
    editTestPlan:'Edit TestPlan',
    addTestPlan:'Add TestPlan',
    planSetList: 'Testset Of Plan',
    testReport: 'Test Report',
    materialManage: 'Material Management',
    materialList: 'Material',
    uploadMaterial: 'Upload',
    configManage: 'Config Item',
    keyList: 'Parameter',
    configList: 'Config',
    taskList: 'Precision Task',
    createTask: 'Create Precision Task',
    suiteList: 'Precision Suite',
    createSuite: 'Create Precision Suite',
    updateSuite:'Update Precision Suite',
    testPointList: 'Precision Point',
    businessCode: 'Business Access',
    createPoint: 'Create Precision Point',
    editPoint: 'Edit Precision Point',
    resourceManage: 'Resource Management',
    tools: 'Tools',
    runScript: 'Excute Script',
    performance: 'Performance Test',
    createPerf: 'Create Performance Test',
    PerfTaskUpload: 'Upload Performance Test',
    updatePerf: 'Update Performance Test',
    perfTaskList: 'Performance Test',
    perfTaskSet: 'Performance Test Set',
    perfTaskPlan:'Performance Test Plan',
    addPerfPlan:'add Performance Plan',
    updatePerfPlan:"Update Performance Plan",
    perfDetailList:'Performance Set Detail',
    createScript: 'Create Performance Script',
    perfTaskConfig: 'Performance Test Config',
    monitor: 'Performance Monitor',
    webUI: 'UI Test',
    uiPageList: 'Packaged Page&Function',
    uiCaseList: 'UI Test Case',
    createUICase: 'Create UI Test Case',
    uiTestsetList: 'UI Test Set',
    machineList: 'Machine Management',
    manualCase: 'Manual Test',
    manualCaseUpload :'Upload Manual Test',
    testLink: 'Manual Case',
    taskLink: 'Manual Task',
    createManualTask: 'Create Manual Task',
    updateManualTask: 'Update Manual Task',
    subTaskList: 'Sub Manual Task',
    backups: 'Backups',
    scanScript: 'Update Script',
    addFeature: 'Feature Storage',
    exploreTest: 'Exploratory Test',
    externalTool: 'External Tool',
    imageProcess: 'Image Tool',
    offlineTools:"Offline Tools",
    sdkTest: 'SDK Test',
    sdkCase: 'Test Case',
    sdkType: 'Test Type',
    sdkModel: 'Test Module',
    sdkConfig: 'Test Config',
    permission: 'Permission Management'
  },
  header:{
    logOut: 'Log Out',
    name: 'User Name',
    screenfull: 'ScreenFull',
    theme: 'Theme'
  },
  navbar: {
  },
  login: {
    title: 'SEP Login',
    subTitle: 'SenseTime Efficiency Platform',
    logIn: 'Log in',
    username: 'Username',
    password: 'Password',
    thirdparty: 'Or connect with',
    tips: '* We recommend using Chrome for a better browsing experience'
  },
  documentation: {
    documentation: 'Documentation',
    github: 'Github Repository'
  },
  permission: {
    roles: 'Your roles',
    switchRoles: 'Switch roles'
  },
  guide: {
    description: 'The guide page is useful for some people who entered the project for the first time. You can briefly introduce the features of the project. Demo is based on ',
    button: 'Show Guide'
  },
  components: {
    documentation: 'Documentation',
    tinymceTips: 'Rich text editor is a core part of management system, but at the same time is a place with lots of problems. In the process of selecting rich texts, I also walked a lot of detours. The common rich text editors in the market are basically used, and the finally chose Tinymce. See documentation for more detailed rich text editor comparisons and introductions.',
    dropzoneTips: 'Because my business has special needs, and has to upload images to qiniu, so instead of a third party, I chose encapsulate it by myself. It is very simple, you can see the detail code in @/components/Dropzone.',
    stickyTips: 'when the page is scrolled to the preset position will be sticky on the top.',
    backToTopTips1: 'When the page is scrolled to the specified position, the Back to Top button appears in the lower right corner',
    backToTopTips2: 'You can customize the style of the button, show / hide, height of appearance, height of the return. If you need a text prompt, you can use element-ui el-tooltip elements externally',
    imageUploadTips: 'Since I was using only the vue@1 version, and it is not compatible with mockjs at the moment, I modified it myself, and if you are going to use it, it is better to use official version.'
  },
  table: {
    dynamicTips1: 'Fixed header, sorted by header order',
    dynamicTips2: 'Not fixed header, sorted by click order',
    dragTips1: 'The default order',
    dragTips2: 'The after dragging order',
    title: 'Title',
    importance: 'Imp',
    type: 'Type',
    remark: 'Remark',
    search: 'Search',
    add: 'Add',
    export: 'Export',
    reviewer: 'reviewer',
    id: 'ID',
    date: 'Date',
    author: 'Author',
    readings: 'Readings',
    status: 'Status',
    actions: 'Actions',
    edit: 'Edit',
    publish: 'Publish',
    draft: 'Draft',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  errorLog: {
    tips: 'Please click the bug icon in the upper right corner',
    description: 'Now the management system are basically the form of the spa, it enhances the user experience, but it also increases the possibility of page problems, a small negligence may lead to the entire page deadlock. Fortunately Vue provides a way to catch handling exceptions, where you can handle errors or report exceptions.',
    documentation: 'Document introduction'
  },
  excel: {
    export: 'Export',
    selectedExport: 'Export selected items',
    placeholder: 'Please enter the file name(default excel-list)'
  },
  zip: {
    export: 'Export',
    placeholder: 'Please enter the file name(default file)'
  },
  theme: {
    change: 'Theme change',
    documentation: 'Theme documentation',
    tips: 'Tips: It is different from the theme-pick on the navbar is two different skinning methods, each with different application scenarios. Refer to the documentation for details.'
  },
  tagsView: {
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All'
  },
  caseManage: {
    replaceTips: 'This tool is used to batch replace the case content under specified conditions. Each filter condition is optional. The relationship between the conditions is "and".',
    searchDescription: 'Only the first 50 data are provided for reference. The actual replacement is subject to database query.',
  }
}
