<template>
<div>
  <!--导航区-->
<el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>用户管理</el-breadcrumb-item>
  <el-breadcrumb-item>用户列表</el-breadcrumb-item>
</el-breadcrumb>
  <!--卡片区-->
<el-card>
  <el-row :gutter="20">
    <el-col :span="8">
      <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
      <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
    </el-input>
    </el-col>
    <el-col :span="4">
      <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
    </el-col>
  </el-row>
  <!--用户列表区-->
  <el-table :data="userlist" border stripe>
    <el-table-column type="index"></el-table-column>
    <el-table-column label="姓名" prop="username"></el-table-column>
    <el-table-column label="邮箱" prop="email"></el-table-column>
    <el-table-column label="角色" prop="role_name"></el-table-column>
    <el-table-column label="电话" prop="mobile"></el-table-column>
    <el-table-column label="状态" prop="mg_state">
      <template slot-scope="scope">
        <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="180px">
      <template slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
          <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
  <!--用户页码区-->
   <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
</el-card>
  <!--添加用户模块-->
<el-dialog
  title="添加用户"
  :visible.sync="addDialogVisible"
  width="50%" @close="addDialogClosed">
  <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
  <el-form-item label="用户名" prop="username">
    <el-input v-model="addForm.username"></el-input>
  </el-form-item>
    <el-form-item label="密码" prop="password">
    <el-input v-model="addForm.password"></el-input>
  </el-form-item>
    <el-form-item label="邮箱" prop="email">
    <el-input v-model="addForm.email"></el-input>
  </el-form-item>
    <el-form-item label="手机" prop="mobile">
    <el-input v-model="addForm.mobile"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
</el-dialog>
  <!--修改用户模块-->
  <el-dialog
  title="修改用户"
  :visible.sync="editDialogVisible"
  width="50%" @close="editDialogClosed">
  <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
  <el-form-item label="用户名">
    <el-input v-model="editForm.username" disabled></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="editForm.email"></el-input>
  </el-form-item>
  <el-form-item label="手机" prop="mobile">
    <el-input v-model="editForm.mobile"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUser">确 定</el-button>
  </span>
</el-dialog>
</div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      } else {
        return cb(new Error('请输入合法的邮箱'))
      }
    }
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      } else {
        return cb(new Error('请输入合法的手机'))
      }
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      editFormRules: {
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }]
      },
      addFormRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名的长度在6~15个字符之间', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      } else {
        this.userlist = res.data.users
        this.total = res.data.total
      }
    },
    handleSizeChange(PageSize) {
      this.queryInfo.pagesize = PageSize
      this.getUserList()
    },
    handleCurrentChange(PageNum) {
      this.queryInfo.pagenum = PageNum
      this.getUserList()
    },
    // 设置用户状态
    async userStateChange(userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        this.$message.error('状态设置失败')
      } else {
        this.$message.success('状态设置成功')
      }
    },
    // 添加用户重置操作
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        // 通过预校验才进行的操作
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败!')
        }
        this.$message.success('添加用户成功!')
        // 关闭添加窗口
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 修改用户
    async showEditDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败!')
      } else {
        this.editForm = res.data
      }
    },
    // 修改用户重置操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        // 修改用户信息
        const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败!')
        }
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('修改用户信息成功!')
      })
    },
    // 根据ID删除用户信息
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户,是否继续?', '提示', { confirmButtonText: '确定', concelButtonText: '取消', type: 'warning' }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.$message.success('删除用户成功!')
      this.getUserList()
    }
  }
}
</script>
