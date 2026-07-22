# 应季食谱参考

基于 Vue 3 + Vite + Element Plus 的响应式食谱参考页面，包含“应季食谱”和“减脂餐”两个页面。

- “应季食谱”整理《成人肥胖食养指南（2024年版）》附录 3 的 7 个地区、4 个季节和 3 档能量示例。
- “减脂餐”通过顶部导航进入，或直接访问 `?page=weight-loss`，目前整理 33 道菜谱，提供热量、餐次、做法、菜谱类型、准备方式和便当友好筛选。

## 开始使用

```bash
npm install
npm run dev
```

## 验证与构建

```bash
npm test
npm run build
```

## 部署前缀配置

生产环境的上下文前缀由 `.env.production` 中的 `VITE_BASE_PATH` 管理：

```dotenv
VITE_BASE_PATH=/weight-manage/
```

如果部署到其他前缀，只需要修改这个配置值并重新构建，不需要修改 Vue 页面代码。Nginx 的 `location` 路径必须与该值保持一致，并保留结尾的 `/`。

## 使用 Nginx 部署

GitHub Actions 会将生产构建发布到 `deploy` 分支。将该分支的内容放到服务器目录 `/var/www/html/weight-manage/`，目录结构应为：

```text
/var/www/html/weight-manage/
├── index.html
└── assets/
```

Nginx 示例配置如下，其中 `weight-manage` 要与 `VITE_BASE_PATH=/weight-manage/` 保持一致：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com;

    root /var/www/html;
    index index.html;

    location = /weight-manage {
        return 301 /weight-manage/;
    }

    location /weight-manage/ {
        try_files $uri $uri/ /weight-manage/index.html;
    }

    location ~* ^/weight-manage/assets/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

检查并重载 Nginx：

```bash
nginx -t
systemctl reload nginx
```

部署完成后访问 `http://example.com/weight-manage/`。例如减脂餐页面地址为 `http://example.com/weight-manage/?page=weight-loss`。

页面会根据当前月份默认进入春、夏、秋、冬中的对应季节；季节、地域、能量档、减脂餐筛选条件和详情记录会同步到 URL，便于分享和恢复浏览状态。减脂餐特别收录前一晚完成、早上快做、前一晚备料和无需加热的单位午餐组合。

应季食谱内容由 `docs/pdf_content.txt`（来源：`docs/1743476136267_20714.pdf`）中的附录 3 文本解析而来。减脂餐内容位于 `src/data/weightLossMeals.js`，对公开菜谱页面做简要转述，并在详情中保留原始来源链接；未明确标注热量的条目会注明为估算。

页面仅用于成人肥胖人群的一般食养参考，不替代指南原文、医生诊断或个体化营养方案；食药物质以 `*` 标识。慢性病、孕期、哺乳期或有进食障碍风险时，请先咨询医生或营养专业人员。
