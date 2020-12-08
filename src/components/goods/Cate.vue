<template>
  <div>
  <!--导航区-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>
  <!--卡片区-->
  <el-card>
    <el-row>
      <el-col>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-col>
    </el-row>
    <!--表格-->
    <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
      <!--是否有效-->
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen;"></i>
        <i class="el-icon-error" v-else style="color: red;"></i>
      </template>
      <!--排序-->
      <template slot="order" slot-scope="scope">
        <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
        <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
        <el-tag type="warning" size="mini" v-else>三级</el-tag>
      </template>
      <!--操作-->
      <template slot="opt" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id,scope.row.cat_name)">编辑</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCate(scope.row.cat_id)">删除</el-button>
      </template>
    </tree-table>
    <!--分页-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>
  <!-- 添加分类的对话框 -->
  <el-dialog
    title="添加分类"
    :visible.sync="addCateDialogVisible"
    width="50%" @close="addCateDialogClosed">
    <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
      <el-form-item label="分类名称:" prop="cat_name">
        <el-input v-model="addCateForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类:">
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" clearable></el-cascader>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addCateDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addCate">确 定</el-button>
    </span>
  </el-dialog>
  <!-- 编辑分类的对话框 -->
  <el-dialog
    title="编辑分类"
    :visible.sync="editCateDialogVisible"
    width="50%" @close="editCateDialogClosed">
    <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
      <el-form-item label="分类名称:" prop="cat_name">
        <el-input v-model="editCateForm.cat_name"></el-input>
      </el-form-item>
    </el-form>
     <span slot="footer" class="dialog-footer">
      <el-button @click="editCateDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editCate">确 定</el-button>
    </span>
  </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagesize: 5,
        pagenum: 1
      },
      catelist: [],
      total: 0,
      columns: [{ label: '分类名称', prop: 'cat_name' }, { label: '是否有效', type: 'template', template: 'isok' }, { label: '排序', type: 'template', template: 'order' }, { label: '操作', type: 'template', template: 'opt' }],
      addCateDialogVisible: false,
      addCateForm: { cat_name: '', cat_pid: 0, cat_level: 0 },
      addCateFormRules: { cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] },
      editCateDialogVisible: false,
      editCateForm: { cat_id: 0, cat_name: '' },
      editCateFormRules: { cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] },
      parentCateList: [],
      cascaderProps: { value: 'cat_id', label: 'cat_name', children: 'children', expandTrigger: 'hover', checkStrictly: true },
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 展示添加分类窗口
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 展示编辑分类窗口
    showEditCateDialog(cateId, cateName) {
      this.editCateForm.cat_id = cateId
      this.editCateForm.cat_name = cateName
      this.editCateDialogVisible = true
    },
    // 获取父级分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败!')
      }
      this.parentCateList = res.data
    },
    // 父级分类的改变事件
    parentCateChange() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类的确定按钮
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!')
        }
        this.$message.success('添加分类成功!')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 添加分类的关闭操作
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 编辑分类的关闭操作
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm.cat_id = 0
      this.editCateForm.cat_name = 0
    },
    // 编辑分类的确定按钮
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return false
        // 修改分类信息
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类信息失败!')
        }
        this.editCateDialogVisible = false
        this.getCateList()
        this.$message.success('修改分类信息成功!')
      })
    },
    // 删除分类
    async delCate(id) {
      const confirmResult = await this.$confirm('此操作将删除该分类,是否继续?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作!')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类信息失败!')
      }
      this.$message.success('删除分类信息成功!')
      this.getCateList()
    }
  }
}
</script>
<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
.el-cascader{
  width:100%;
}
</style>
