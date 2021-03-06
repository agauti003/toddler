// Generated by IcedCoffeeScript 108.0.13
var window = global;

(function () {
  var config, gen, module, type2default_value;

  config = window.config;

  module = this;

  type2default_value = function (type) {
    switch (type.main) {
      case "t_bool":
        return "False";
      case "t_uint256":
        return "0";
      case "t_int256":
        return "0";
      case "t_address":
        return "sp.address()";
      case "t_string_memory_ptr":
        return '""';
      case "map":
        return "sp.BigMap()";
      default:
        throw new Error("unknown solidity type '" + type + "'");
    }
  };

  this.bin_op_name_map = {
    ADD: "+",
    SUB: "-",
    MUL: "*",
    DIV: "/",
    MOD: "%",
    EQ: "==",
    NE: "!=",
    GT: ">",
    LT: "<",
    GTE: ">=",
    LTE: "<=",
    BOOL_AND: "and",
    BOOL_OR: "or",
    BIT_AND: "&",
    BIT_OR: "|",
    BIT_XOR: "^",
  };

  this.bin_op_name_cb_map = {
    ASSIGN: function (a, b) {
      return "" + a + " = " + b;
    },
    ASS_ADD: function (a, b) {
      return "" + a + " += " + b;
    },
    ASS_SUB: function (a, b) {
      return "" + a + " -= " + b;
    },
    ASS_MUL: function (a, b) {
      return "" + a + " *= " + b;
    },
    ASS_DIV: function (a, b) {
      return "" + a + " /= " + b;
    },
    INDEX_ACCESS: function (a, b) {
      return "" + a + "[" + b + "]";
    },
  };

  this.un_op_name_cb_map = {
    MINUS: function (a) {
      return "-(" + a + ")";
    },
    PLUS: function (a) {
      return "+(" + a + ")";
    },
    BIT_NOT: function (a) {
      return "~(" + a + ")";
    },
  };

  this.Gen_context = (function () {
    Gen_context.prototype.parent_ctx = null;

    Gen_context.prototype.fn_hash = {};

    Gen_context.prototype.var_hash = {};

    Gen_context.prototype.in_class = false;

    Gen_context.prototype.in_fn = false;

    Gen_context.prototype.tmp_idx = 0;

    Gen_context.prototype.trim_expr = "";

    function Gen_context() {
      this.fn_hash = {};
      this.var_hash = {};
    }

    Gen_context.prototype.mk_nest = function () {
      var t;
      t = new module.Gen_context();
      t.parent_ctx = this;
      t.var_hash = clone(this.var_hash);
      t.fn_hash = this.fn_hash;
      return t;
    };

    return Gen_context;
  })();

  this.gen = function (ast, opt) {
    var ctx, ret;
    if (opt == null) {
      opt = {};
    }
    ctx = new module.Gen_context();
    ret = module._gen(ast, opt, ctx);
    return "import smartpy as sp\n" + ret;
  };

  this._gen = gen = function (ast, opt, ctx) {
    var arg_list,
      body,
      cb,
      cond,
      decl,
      f,
      fn,
      idx,
      jl,
      k,
      name,
      op,
      ret,
      scope,
      t,
      v,
      val,
      _a,
      _b,
      _i,
      _j,
      _k,
      _l,
      _len,
      _len1,
      _len2,
      _len3,
      _len4,
      _m,
      _ref,
      _ref1,
      _ref2,
      _ref3,
      _ref4,
      _ref5;
    switch (ast.constructor.name) {
      case "Var":
        name = ast.name;
        if (ctx.parent_ctx.var_hash[name]) {
          return "self.data." + name;
        } else if ((decl = ctx.var_hash[name])) {
          if (decl._is_arg) {
            return "" + config.params + "." + name;
          } else {
            return name;
          }
        } else if (ctx.fn_hash[name]) {
          return "self." + name;
        } else if (name === "msg") {
          return "msg";
        } else {
          p("ctx.parent_ctx.var_hash", ctx.parent_ctx.var_hash);
          p("ctx.var_hash", ctx.var_hash);
          throw new Error("unknown var " + name);
        }
        break;
      case "Const":
        switch (ast.type.main) {
          case "string":
            return JSON.stringify(ast.val);
          default:
            return ast.val;
        }
        break;
      case "Bin_op":
        _a = gen(ast.a, opt, ctx);
        _b = gen(ast.b, opt, ctx);
        if ((op = module.bin_op_name_map[ast.op])) {
          return "(" + _a + " " + op + " " + _b + ")";
        } else if ((cb = module.bin_op_name_cb_map[ast.op])) {
          return cb(_a, _b, ctx, ast);
        } else {
          throw new Error("Unknown/unimplemented bin_op " + ast.op);
        }
        break;
      case "Un_op":
        if ((cb = module.un_op_name_cb_map[ast.op])) {
          return cb(gen(ast.a, opt, ctx), ctx);
        } else {
          throw new Error("Unknown/unimplemented un_op " + ast.op);
        }
        break;
      case "Field_access":
        t = gen(ast.t, opt, ctx);
        ret = "" + t + "." + ast.name;
        if (ret === "msg.sender") {
          ret = "sp.sender";
        }
        return ret;
      case "Fn_call":
        fn = gen(ast.fn, opt, ctx);
        arg_list = [];
        _ref = ast.arg_list;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          arg_list.push(gen(v, opt, ctx));
        }
        if (fn === "require") {
          arg_list[0];
          return "sp.verify(" + arg_list[0] + ")";
        }
        return "" + fn + "(" + arg_list.join(", ") + ")";
      case "Scope":
        jl = [];
        _ref1 = ast.list;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          v = _ref1[_j];
          jl.push(gen(v, opt, ctx));
        }
        if (jl.length === 0) {
          jl.push("pass");
        }
        return join_list(jl, "");
      case "Var_decl":
        ctx.var_hash[ast.name] = ast;
        if (ctx.in_class) {
          return "";
        }
        if (ctx.in_fn) {
          if (ast.assign_value) {
            val = gen(ast.assign_value, opt, ctx);
          } else {
            val = type2default_value(ast.type);
          }
          return "" + ast.name + " = " + val;
          return "";
        }
        throw new Error("unknown Var_decl case");
        break;
      case "Ret_multi":
        if (ast.t_list.length > 1) {
          throw new Error("not implemented ast.t_list.length > 1");
        }
        jl = [];
        _ref2 = ast.t_list;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          v = _ref2[_k];
          jl.push(gen(v, opt, ctx));
        }
        return "return " + jl.join(", ");
      case "If":
        cond = gen(ast.cond, opt, ctx);
        t = gen(ast.t, opt, ctx);
        f = gen(ast.f, opt, ctx);
        return (
          "if " +
          cond +
          ":\n  " +
          make_tab(t, "  ") +
          "\nelse:\n  " +
          make_tab(f, "  ")
        );
      case "While":
        cond = gen(ast.cond, opt, ctx);
        scope = gen(ast.scope, opt, ctx);
        return "while " + cond + ":\n  " + make_tab(scope, "  ");
      case "Class_decl":
        ctx = ctx.mk_nest();
        ctx.in_class = true;
        jl = [];
        _ref3 = ast.scope.list;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          v = _ref3[_l];
          switch (v.constructor.name) {
            case "Var_decl":
              ctx.var_hash[v.name] = v;
              break;
            case "Fn_decl_multiret":
              ctx.fn_hash[v.name] = v;
              break;
            default:
              throw new Error(
                "unimplemented v.constructor.name=" + v.constructor.name
              );
          }
        }
        body = gen(ast.scope, opt, ctx);
        jl = [];
        _ref4 = ctx.var_hash;
        for (k in _ref4) {
          v = _ref4[k];
          jl.push("" + k + " = " + type2default_value(v.type));
        }
        return (
          "class " +
          ast.name +
          "(sp.Contract):\n  def __init__(self):\n    self.init(" +
          jl.join(",\n      ") +
          ")\n  \n  " +
          make_tab(body, "  ")
        );
      case "Fn_decl_multiret":
        ctx = ctx.mk_nest();
        ctx.in_fn = true;
        _ref5 = ast.arg_name_list;
        for (idx = _m = 0, _len4 = _ref5.length; _m < _len4; idx = ++_m) {
          v = _ref5[idx];
          ctx.var_hash[v] = {
            _is_arg: true,
            type: ast.type_i.nest_list[idx],
          };
        }
        body = gen(ast.scope, opt, ctx);
        return (
          "def " +
          ast.name +
          "(self, " +
          config.params +
          "):\n  " +
          make_tab(body, "  ")
        );
      default:
        if (opt.next_gen != null) {
          return opt.next_gen(ast, opt, ctx);
        }

        /* !pragma coverage-skip-block */
        perr(ast);
        throw new Error("unknown ast.constructor.name=" + ast.constructor.name);
    }
  };
}.call((window.translate = {})));
