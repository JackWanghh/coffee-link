import SwiftUI

struct ProfileView: View {
    let profile: UserProfile
    let openSharingCenter: () -> Void
    let openChats: () -> Void
    let openAppearance: () -> Void
    let logout: () -> Void

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                profileCard
                sharingCenterCard
                menuCard
                logoutButton
                footer
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 18)
        }
        .background(CoffeeLinkTheme.background)
        .accessibilityIdentifier("profile.screen")
    }

    private var profileCard: some View {
        VStack(spacing: 14) {
            HStack(spacing: 14) {
                ZStack(alignment: .bottomTrailing) {
                    CoffeeAvatar(name: profile.name, imageURL: profile.avatarURL, size: 70)
                        .overlay(Circle().stroke(CoffeeLinkTheme.border, lineWidth: 2))
                    if profile.isVerified {
                        Image(systemName: "checkmark")
                            .font(.system(size: 8, weight: .black))
                            .foregroundStyle(.white)
                            .frame(width: 18, height: 18)
                            .background(CoffeeLinkTheme.success, in: Circle())
                            .overlay(Circle().stroke(CoffeeLinkTheme.surface, lineWidth: 2))
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(profile.name)
                        .font(.system(size: 19, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.primaryText)
                        .lineLimit(1)
                    Text("\(profile.title) @ \(profile.company)")
                        .font(.system(size: 13))
                        .foregroundStyle(CoffeeLinkTheme.secondaryText)
                        .lineLimit(1)
                    HStack(spacing: 8) {
                        Label("身份已核验", systemImage: "shield.checkered")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(CoffeeLinkTheme.accent)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(CoffeeLinkTheme.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 5, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 5, style: .continuous).stroke(CoffeeLinkTheme.accent.opacity(0.3), lineWidth: 1))
                        Text(maskedPhone)
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(CoffeeLinkTheme.secondaryText)
                    }
                    .padding(.top, 3)
                }
                Spacer(minLength: 0)
            }

            Rectangle().fill(CoffeeLinkTheme.border).frame(height: 1)

            HStack(spacing: 0) {
                stat(value: "\(profile.totalChats)", title: "对谈总数")
                divider
                stat(value: String(format: "%.1f", profile.rating), title: "综合评分", accented: true)
                divider
                stat(value: profile.onTimeRate, title: "按时率")
            }
        }
        .padding(16)
        .background {
            ZStack(alignment: .topTrailing) {
                CoffeeLinkTheme.surface
                RadialGradient(colors: [CoffeeLinkTheme.accent.opacity(0.16), .clear], center: .topTrailing, startRadius: 0, endRadius: 130)
            }
            .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        }
        .overlay(RoundedRectangle(cornerRadius: 24, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
        .shadow(color: .black.opacity(0.22), radius: 10, y: 5)
    }

    private var sharingCenterCard: some View {
        Button(action: openSharingCenter) {
            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    Image(systemName: "cup.and.saucer.fill")
                        .font(.system(size: 23))
                        .foregroundStyle(CoffeeLinkTheme.accent)
                        .frame(width: 50, height: 50)
                        .background(CoffeeLinkTheme.accent.opacity(0.13), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 7) {
                            Text("分享中心")
                                .font(.system(size: 15, weight: .bold))
                            Text(profile.isSharingOpen ? "已开放分享" : "未开放分享")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundStyle(profile.isSharingOpen ? CoffeeLinkTheme.success : CoffeeLinkTheme.secondaryText)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 3)
                                .background((profile.isSharingOpen ? CoffeeLinkTheme.success : CoffeeLinkTheme.secondaryText).opacity(0.12), in: RoundedRectangle(cornerRadius: 4))
                        }
                        Text("设置签名饮品、开放 30 分钟主题及 0 元互换")
                            .font(.system(size: 12))
                            .foregroundStyle(CoffeeLinkTheme.secondaryText)
                            .multilineTextAlignment(.leading)
                    }
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.accent)
                }
                Rectangle().fill(CoffeeLinkTheme.border).frame(height: 1)
                HStack(spacing: 16) {
                    Label("\(profile.signatureDrink.name)（¥\(decimalText(profile.signatureDrink.price))）", systemImage: "cup.and.saucer")
                    Spacer(minLength: 0)
                    Label(profile.acceptsTopicSwap ? "互换（周限\(profile.weeklySwapLimit)次）" : "未开启互换", systemImage: "arrow.triangle.2.circlepath")
                        .foregroundStyle(.blue)
                }
                .font(.system(size: 11))
                .foregroundStyle(CoffeeLinkTheme.secondaryText)
                .lineLimit(1)
            }
            .padding(16)
            .foregroundStyle(CoffeeLinkTheme.primaryText)
            .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(profile.isSharingOpen ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1))
            .shadow(color: profile.isSharingOpen ? CoffeeLinkTheme.accent.opacity(0.18) : .clear, radius: 12)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("进入分享中心")
        .accessibilityIdentifier("进入分享中心")
    }

    private var menuCard: some View {
        VStack(spacing: 0) {
            menuRow(title: "我的对谈与日程", subtitle: "查看已预约、待付款及历史对谈", systemImage: "calendar", action: openChats)
            Rectangle().fill(CoffeeLinkTheme.border).frame(height: 1)
            menuRow(title: "外观与主题切换", subtitle: "暖阳燕麦 / 暗夜流光 / 极简白", systemImage: "paintpalette", action: openAppearance)
            Rectangle().fill(CoffeeLinkTheme.border).frame(height: 1)
            HStack(spacing: 13) {
                Image(systemName: "shield.checkered").font(.system(size: 18)).foregroundStyle(CoffeeLinkTheme.success).frame(width: 20)
                VStack(alignment: .leading, spacing: 3) {
                    Text("对谈安全与履约保障").font(.system(size: 14, weight: .medium))
                    Text("24小时维权 · 未到场全额退款 · 盲评机制").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                }
                Spacer(minLength: 0)
                Text("100%履约").font(.system(size: 11, weight: .semibold, design: .monospaced)).foregroundStyle(CoffeeLinkTheme.success)
            }
            .foregroundStyle(CoffeeLinkTheme.primaryText)
            .padding(16)
            .frame(minHeight: 76)
        }
        .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private func menuRow(title: String, subtitle: String, systemImage: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 13) {
                Image(systemName: systemImage).font(.system(size: 18)).foregroundStyle(CoffeeLinkTheme.accent).frame(width: 20)
                VStack(alignment: .leading, spacing: 3) {
                    Text(title).font(.system(size: 14, weight: .medium))
                    Text(subtitle).font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.right").font(.system(size: 12, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            }
            .foregroundStyle(CoffeeLinkTheme.primaryText)
            .padding(16)
            .frame(minHeight: 76)
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier(title)
    }

    private var logoutButton: some View {
        Button(action: logout) {
            Label("切换账号 / 退出登录", systemImage: "rectangle.portrait.and.arrow.right")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(CoffeeLinkTheme.secondaryText)
                .frame(maxWidth: .infinity, minHeight: 44)
                .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    private var footer: some View {
        Text("咖啡对谈 · 真实同侪经验交流平台\n身份已核验 · 职业信息由用户自行填写")
            .font(.system(size: 11))
            .foregroundStyle(CoffeeLinkTheme.secondaryText.opacity(0.72))
            .multilineTextAlignment(.center)
            .lineSpacing(4)
            .frame(maxWidth: .infinity)
    }

    private func stat(value: String, title: String, accented: Bool = false) -> some View {
        VStack(spacing: 4) {
            Text(value).font(.system(size: 18, weight: .bold)).foregroundStyle(accented ? CoffeeLinkTheme.accent : CoffeeLinkTheme.primaryText)
            Text(title).font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
        }
        .frame(maxWidth: .infinity)
    }

    private var divider: some View { Rectangle().fill(CoffeeLinkTheme.border).frame(width: 1, height: 28) }

    private var maskedPhone: String {
        if profile.phone.contains("****") { return profile.phone }
        let digits = profile.phone.filter(\.isNumber)
        guard digits.count >= 11 else { return profile.phone }
        let localNumber = String(digits.suffix(11))
        let prefix = profile.phone.contains("+86") ? "+86 " : ""
        return "\(prefix)\(localNumber.prefix(3))****\(localNumber.suffix(4))"
    }
}
