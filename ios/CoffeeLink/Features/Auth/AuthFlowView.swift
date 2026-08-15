import SwiftUI

enum AuthMode: String, CaseIterable, Identifiable {
    case login
    case register
    case reset

    var id: String { rawValue }

    var title: String {
        switch self {
        case .login: "密码登录"
        case .register: "新用户注册"
        case .reset: "找回密码"
        }
    }
}

struct AuthDraft: Equatable {
    var phone: String
    var otp: String
    var password: String
    var confirmPassword: String
    var acceptedTerms: Bool

    static let loginDemo = AuthDraft(phone: "13800138000", otp: "", password: "Pass123456", confirmPassword: "", acceptedTerms: false)
    static let registerDemo = AuthDraft(phone: "13800138000", otp: "123456", password: "Pass123456", confirmPassword: "Pass123456", acceptedTerms: true)

    static func visualReference(for mode: AuthMode) -> AuthDraft {
        AuthDraft(
            phone: "138****8888",
            otp: "",
            password: "",
            confirmPassword: "",
            acceptedTerms: mode == .register
        )
    }
}

enum AuthValidationError: Equatable {
    case mainlandPhoneRequired
    case otpRequired
    case passwordRequired
    case passwordsDoNotMatch
    case termsRequired

    var message: String {
        switch self {
        case .mainlandPhoneRequired: "请输入正确的中国大陆手机号"
        case .otpRequired: "请输入 6 位短信验证码"
        case .passwordRequired: "密码需为 8～20 位字母、数字组合"
        case .passwordsDoNotMatch: "两次输入的密码不一致"
        case .termsRequired: "请先阅读并同意服务协议"
        }
    }
}

enum AuthValidator {
    static func normalizedPhone(_ value: String) -> String {
        String(value.filter { $0.isNumber }.suffix(11))
    }

    static func isMainlandPhone(_ value: String) -> Bool {
        value.range(of: "^1[3-9]\\d{9}$", options: .regularExpression) != nil
    }

    static func isValidPassword(_ value: String) -> Bool {
        guard (8...20).contains(value.count) else { return false }
        return value.range(of: "[A-Za-z]", options: .regularExpression) != nil
            && value.range(of: "[0-9]", options: .regularExpression) != nil
    }

    static func registrationErrors(_ draft: AuthDraft) -> [AuthValidationError] {
        var errors: [AuthValidationError] = []
        if !isMainlandPhone(normalizedPhone(draft.phone)) { errors.append(.mainlandPhoneRequired) }
        if draft.otp.range(of: "^\\d{6}$", options: .regularExpression) == nil { errors.append(.otpRequired) }
        if !isValidPassword(draft.password) { errors.append(.passwordRequired) }
        if draft.password != draft.confirmPassword { errors.append(.passwordsDoNotMatch) }
        if !draft.acceptedTerms { errors.append(.termsRequired) }
        return errors
    }

    static func resetErrors(_ draft: AuthDraft) -> [AuthValidationError] {
        registrationErrors(draft).filter { $0 != .termsRequired }
    }
}

struct AuthFlowView: View {
    @Bindable var store: AppStore
    let onAuthenticated: () -> Void
    let onDismiss: () -> Void
    @State private var mode: AuthMode
    @State private var draft: AuthDraft
    @State private var errorMessage: String?
    @FocusState private var focusedField: Field?
    private let usesReferencePresentation: Bool

    private enum Field: Hashable { case phone, otp, password, confirmation }

    init(store: AppStore, initialMode: AuthMode = .login, referencePresentation: Bool = false, onAuthenticated: @escaping () -> Void, onDismiss: @escaping () -> Void) {
        self.store = store
        self.onAuthenticated = onAuthenticated
        self.onDismiss = onDismiss
        self.usesReferencePresentation = referencePresentation
        _mode = State(initialValue: initialMode)
        _draft = State(initialValue: referencePresentation ? .visualReference(for: initialMode) : initialMode == .login ? .loginDemo : .registerDemo)
    }

    var body: some View {
        ZStack {
            CoffeeLinkTheme.background.opacity(0.96).ignoresSafeArea()
            Color.black.opacity(0.22).ignoresSafeArea()
            Circle().fill(CoffeeLinkTheme.accent.opacity(0.19)).frame(width: 250, height: 250).blur(radius: 70).offset(x: -105, y: -270)
            Circle().fill(Color.orange.opacity(0.10)).frame(width: 220, height: 220).blur(radius: 76).offset(x: 105, y: 270)
            GeometryReader { proxy in
                ScrollView(showsIndicators: false) {
                    VStack {
                        panel
                    }
                    .frame(maxWidth: .infinity)
                        .frame(minHeight: proxy.size.height, alignment: .center)
                        .padding(.horizontal, 16)
                }
                .scrollDismissesKeyboard(.interactively)
            }
        }
        .accessibilityIdentifier("auth.overlay")
    }

    private var panel: some View {
        VStack(spacing: 0) {
            HStack(spacing: 11) {
                Image(systemName: "cup.and.saucer.fill")
                    .font(.system(size: 21, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.onAccent)
                    .frame(width: 38, height: 38)
                    .background(CoffeeLinkTheme.accent, in: RoundedRectangle(cornerRadius: 11, style: .continuous))
                VStack(alignment: .leading, spacing: 2) {
                    Text(mode.title).font(.system(size: 19, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
                    Text("CoffeeLink · 和真正做过的人聊一次").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                }
                Spacer()
                Button(action: onDismiss) {
                    Image(systemName: "xmark").font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.secondaryText).frame(width: 32, height: 32).background(Color.black.opacity(0.22), in: Circle())
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("auth.close")
            }
            .padding(.horizontal, 20).padding(.vertical, 18)
            Divider().overlay(CoffeeLinkTheme.border)
            VStack(alignment: .leading, spacing: 15) {
                phoneField
                if mode != .login { otpField }
                passwordField(label: mode == .reset ? "设置新密码 (8～20位包含字母+数字)" : mode == .login ? "登录密码" : "设置密码 (8～20位包含字母+数字)", binding: $draft.password, field: .password, placeholder: mode == .login ? "请输入 8~20 位密码" : "设置8~20位字母数字密码")
                if mode != .login { passwordField(label: mode == .reset ? "确认新密码 (再次输入)" : "确认密码 (再次输入)", binding: $draft.confirmPassword, field: .confirmation, placeholder: mode == .reset ? "再次输入新密码校对" : "再次输入相同密码确认") }
                if mode == .login { demoHint } else if mode == .register { agreement }
                if let errorMessage { Text(errorMessage).font(.system(size: 12, weight: .medium)).foregroundStyle(Color.red.opacity(0.9)) }
                CoffeePrimaryButton(title: primaryTitle, isEnabled: isPrimaryEnabled || usesReferencePresentation, accessibilityIdentifier: "auth.submit") { submit() }
                switchLinks
            }
            .padding(20)
        }
        .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
        .shadow(color: .black.opacity(0.48), radius: 28, y: 12)
        .frame(maxWidth: 361)
    }

    private var phoneField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(mode == .reset ? "已注册的手机号码 (+86)" : "手机号码 (+86)").font(.system(size: 13, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            HStack(spacing: 8) {
                Image(systemName: "iphone").foregroundStyle(CoffeeLinkTheme.secondaryText)
                Text("+86").font(.system(size: 14)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                TextField("138****8888", text: $draft.phone)
                    .keyboardType(.phonePad).textContentType(.telephoneNumber).focused($focusedField, equals: .phone)
                    .foregroundStyle(CoffeeLinkTheme.primaryText).tint(CoffeeLinkTheme.accent)
                    .accessibilityIdentifier("auth.phone")
            }
            .padding(.horizontal, 14).frame(height: 48).background(Color.black.opacity(0.24), in: RoundedRectangle(cornerRadius: 12, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
        }
    }

    private var otpField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(mode == .reset ? "短信安全验证码 (6位数字)" : "短信验证码 (6位数字)").font(.system(size: 13, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            HStack(spacing: 8) {
                TextField("6位短信验证码", text: $draft.otp).keyboardType(.numberPad).textContentType(.oneTimeCode).focused($focusedField, equals: .otp).foregroundStyle(CoffeeLinkTheme.primaryText).tint(CoffeeLinkTheme.accent).accessibilityIdentifier("auth.otp")
                Button("获取验证码") {}.font(.system(size: 13, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent).frame(width: 91, height: 40).background(CoffeeLinkTheme.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 10, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).stroke(CoffeeLinkTheme.accent.opacity(0.35), lineWidth: 1))
            }
            .padding(.leading, 14).padding(.trailing, 4).frame(height: 48).background(Color.black.opacity(0.24), in: RoundedRectangle(cornerRadius: 12, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
        }
    }

    private func passwordField(label: String, binding: Binding<String>, field: Field, placeholder: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack { Text(label).font(.system(size: 13, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.primaryText); Spacer(); if mode == .login { Button("忘记密码？") { setMode(.reset) }.font(.system(size: 12, weight: .medium)).foregroundStyle(CoffeeLinkTheme.accent) } }
            HStack(spacing: 9) {
                Image(systemName: "lock").foregroundStyle(CoffeeLinkTheme.secondaryText)
                SecureField(placeholder, text: binding).textContentType(mode == .login ? .password : .newPassword).focused($focusedField, equals: field).foregroundStyle(CoffeeLinkTheme.primaryText).tint(CoffeeLinkTheme.accent).accessibilityIdentifier(field == .password ? "auth.password" : "auth.confirmation")
                Image(systemName: "eye").foregroundStyle(CoffeeLinkTheme.secondaryText)
            }
            .padding(.horizontal, 14).frame(height: 48).background(Color.black.opacity(0.24), in: RoundedRectangle(cornerRadius: 12, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
        }
    }

    private var demoHint: some View {
        HStack(alignment: .top, spacing: 7) {
            Image(systemName: "lightbulb.fill").foregroundStyle(Color.yellow.opacity(0.85))
            VStack(alignment: .leading, spacing: 3) { Text("快捷演示账号测试：").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText); HStack { Text("演示手机号: 13800138000").font(.system(size: 11, weight: .semibold)); Spacer(); Text("密码: Pass123456").font(.system(size: 11, weight: .semibold)) }.foregroundStyle(CoffeeLinkTheme.secondaryText) }
        }
        .padding(12).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private var agreement: some View {
        Button { draft.acceptedTerms.toggle() } label: { HStack(alignment: .top, spacing: 8) { Image(systemName: draft.acceptedTerms ? "checkmark.square.fill" : "square").foregroundStyle(draft.acceptedTerms ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText); Text("已阅读并同意 《CoffeeLink用户服务协议》 与 《隐私政策》").font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText).multilineTextAlignment(.leading) } }.buttonStyle(.plain).accessibilityIdentifier("auth.terms")
    }

    private var switchLinks: some View {
        HStack(spacing: 5) {
            Spacer()
            Text(mode == .login ? "还没有账号？" : mode == .register ? "已有账号？" : "想起密码了？").font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            Button(mode == .login ? "免费注册新账号" : "返回账号登录") { setMode(mode == .login ? .register : .login) }.font(.system(size: 13, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent)
            Spacer()
        }
        .accessibilityIdentifier("auth.switch")
    }

    private var primaryTitle: String { mode == .login ? "立即登录  →" : mode == .register ? "完成注册并登录" : "重置密码并返回登录" }
    private var isPrimaryEnabled: Bool {
        switch mode { case .login: AuthValidator.isMainlandPhone(AuthValidator.normalizedPhone(draft.phone)) && !draft.password.isEmpty; case .register: AuthValidator.registrationErrors(draft).isEmpty; case .reset: AuthValidator.resetErrors(draft).isEmpty }
    }

    private func setMode(_ newMode: AuthMode) {
        mode = newMode
        errorMessage = nil
        if usesReferencePresentation {
            draft = .visualReference(for: newMode)
        } else {
            if newMode != .login && draft.otp.isEmpty { draft.otp = "123456" }
            if newMode == .login { draft.confirmPassword = "" }
        }
    }

    private func submit() {
        switch mode {
        case .login:
            if store.login(phone: draft.phone, password: draft.password) { onAuthenticated() } else { errorMessage = store.lastErrorMessage }
        case .register:
            guard let first = AuthValidator.registrationErrors(draft).first else {
                guard store.register(phone: draft.phone, password: draft.password) else { errorMessage = store.lastErrorMessage; return }
                draft.password = ""
                draft.confirmPassword = ""
                setMode(.login)
                return
            }
            errorMessage = first.message
        case .reset:
            guard let first = AuthValidator.resetErrors(draft).first else {
                guard store.resetPassword(draft.password) else { errorMessage = store.lastErrorMessage; return }
                draft.password = ""
                draft.confirmPassword = ""
                setMode(.login)
                return
            }
            errorMessage = first.message
        }
    }
}
