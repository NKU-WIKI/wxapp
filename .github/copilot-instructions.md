# Blockbond 项目规范与配置

## 项目概述 Blockbond 是一个基于 FastAPI 的多租户业务平台，支持 AI 搜索、RAG、用户画像等功能。

## 环境信息 - **服务器**: Alibaba Cloud Linux 3.2104 LTS 64位 4c8g

- **SSH**: root@123.56.196.155

- **Python**: /opt/venvs/base/bin/python(3.12)

- **Poetry**: /opt/venvs/base/bin/poetry(2.1.4)

- **包管理**: 使用 Poetry 管理 Python 环境和依赖 - **弃用模块**: apps/gateway 模块已弃用，直接忽略

  ## 开发环境启动

  ### API 服务启动

  ```bash # **关闭代理** unset http_proxy https_proxy all_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY ```

  #### 前台启动


#### 后台启动

```bash
**一定记得关闭代理**

clash off; nohup poetry run uvicorn apps.api.main:app --host 0.0.0.0 --port 8001 --reload > app.log 2>&1 &  
./setup.sh #(dev用户一键启动)
```

#### 停止服务

```bash
sudo kill -9 $(sudo lsof -t -i:8001)
```

## 数据库操作

### PostgreSQL 连接

```bash
docker exec -it blockbond_postgres psql -U postgres \c blockbond \dt # 查看所有表
```

### 数据库重置

```bash
#删除并重建数据库

DROP DATABASE blockbond; CREATE DATABASE blockbond;
```

### 数据库迁移

```bash
poetry run alembic upgrade head
```

## ETL 与索引

### 环境变量设置

```bash
export ETL_TENANT_ID=f6303899-a51a-460a-9cd8-fe35609151eb
```

### ETL 构建

```bash
poetry run python tools/etl.py build --data-path /data/tenants/${ETL_TENANT_ID}/raw --sinks elasticsearch --recreate-index
```

### 索引管理

```bash
#索引初始化

poetry run python -m tools.index_bootstrap f6303899-a51a-460a-9cd8-fe35609151eb

# 增量索引

poetry run python -m tools.index_incremental f6303899-a51a-460a-9cd8-fe35609151eb
```

## 测试信息

### 测试执行

```bash
poetry run pytest # 运行单测在 tests/ 目录下
```

### 测试账号与令牌（仅本地开发）

#### Nankai 租户 (tenant_id = f6303899-a51a-460a-9cd8-fe35609151eb)

- **Username**: nankai_user
- **Password**: Test@1234
- **Token**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZDk2M2QyYS03NjcyLTRiNGEtOWE2YS1iMzYwNWQwYjJkNTIiLCJ0ZW5hbnRfaWQiOiJmNjMwMzg5OS1hNTFhLTQ2MGEtOWNkOC1mZTM1NjA5MTUxZWIiLCJuaWNrbmFtZSI6Im5hbmthaV91c2VyIiwicm9sZXMiOlsidXNlciJdLCJleHAiOjE3NTg1MDA3NTR9.OjB-qY3qIakzepMC7i0x5DJdqlANPLATUg9a_UjHU1w  
  获取token:  
  curl --location --request POST 'http://123.56.196.155:8001/api/v1/auth/login' \  
  --header 'User-Agent: Apifox/1.0.0 (https://apifox.com)' \  
  --header 'Content-Type: application/json' \  
  --header 'Accept: */*' \  
  --header 'Host: 123.56.196.155:8001' \  
  --header 'Connection: keep-alive' \  
  --data-raw '{  
  "username": "nankai_user",  
  "password": "Test@1234",  
  "tenant_id": "f6303899-a51a-460a-9cd8-fe35609151eb"  
  }'

#### Default 租户 (tenant_id = 00000000-0000-0000-0000-000000000000)

- **Username**: testuser2
- **Password**: Test@1234
- **Token**: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidGVuYW50X2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwibmlja25hbWUiOiJcdTZkNGJcdThiZDVcdTc1MjhcdTYyMzcyIiwicm9sZXMiOlsidXNlciJdLCJleHAiOjE3NTUyMzk1MTZ9.Pf-zywyMzsvH9aHNc1FC6queZAIOuvsmV3Tdk8UQXdM

> **注意**: 以上 token 会随时间过期，过期后请通过 `/api/v1/auth/login` 重新获取。

## 部署说明

### 基础设施部署 使用 docker-compose 部署基础设施：

```bash
docker-compose up -d
```

- **包含服务**: PostgreSQL, Elasticsearch, Qdrant, Redis, MinIO

- **注意**: 不要使用容器部署 API 服务

  ### 重要提醒 - 数据迁移后要执行 `alembic upgrade head` 命令

- 配置文件位置: `libs/config/settings.py` 和 `.env`

- 最佳实践沉淀到: `.cursor/rules/practices.mdc`

- 文档沉淀到: `docs/` 目录


## 配置文件参考

### .env 配置示例

```bash
# 微信小程序主体

WECHAT_APPID=wxe0c82418cb888db0  
WECHAT_APPSECRET=3fc2c5285abebc0e793c87ff6e642b8e

# 应用程序环境

ENV=development  
DEBUG_INFO=True

# API 服务

API_PORT=8001  
API_BASE_URL=http://localhost:8001

# Gateway 服务（已弃用）

GATEWAY_PORT=8002

# 安全与认证

SECRET_KEY=a_very_secret_key_that_should_be_long_and_random  
JWT_SECRET=a_very_secret_key_that_should_be_long_and_random  
JWT_ALGORITHM=HS256  
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# PostgreSQL 数据库

POSTGRES_HOST=localhost  
POSTGRES_PORT=5432  
POSTGRES_USER=postgres  
POSTGRES_PASSWORD=blockbond0!  
POSTGRES_DB=blockbond

# Elasticsearch

ES_HOST=localhost  
ES_PORT=9200  
ES_INDEX_NAME=main_index

# Qdrant

QDRANT_HOST=localhost  
QDRANT_PORT=6333  
QDRANT_COLLECTION=main_index  
QDRANT_BATCH_SIZE=32

# MinIO

MINIO_ENDPOINT=localhost:9000  
MINIO_ACCESS_KEY=minioadmin  
MINIO_SECRET_KEY=minioadmin  
MINIO_BUCKET=blockbond  
UPLOAD_DIR=/data/uploads  
STATIC_URL_PREFIX=/static

# Redis（用于热词聚合与分布式限流）

REDIS_ENABLE=true  
REDIS_HOST=127.0.0.1  
REDIS_PORT=6379  
REDIS_DB=0  
REDIS_PASSWORD=

# 限流（按需调整）

RATELIMIT_AGENT_CHAT_PER_MINUTE=30  
RATELIMIT_AGENT_EMBEDDINGS_PER_MINUTE=60  
RATELIMIT_AGENT_RAG_PER_MINUTE=30

# ZhipuAI

ZHIPU_BASE_URL=https://open.bigmodel.cn/api/paas/v4/  
ZHIPU_API_KEY=e1821b5511b74f43981a88ebb274cc9a.Ngb44ANQZkkOIKPB  
ZHIPU_MODEL=glm-4.5-airx  
ZHIPU_EMBEDDING_MODEL=embedding-3  
ai_call_remote_enable = True

MODERATION_SEED_PATH=static/config/banwords.default.json

UPLOAD_MAX_SIZE_BYTES=10485760  
UPLOAD_ALLOWED_CONTENT_TYPES=image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain微信小程序主体

WECHAT_APPID=wxe0c82418cb888db0  
WECHAT_APPSECRET=3fc2c5285abebc0e793c87ff6e642b8e

# 应用程序环境

ENV=development  
DEBUG_INFO=True

# API 服务

API_PORT=8001  
API_BASE_URL=http://localhost:8001

# Gateway 服务（已弃用）

GATEWAY_PORT=8002

# 安全与认证

SECRET_KEY=a_very_secret_key_that_should_be_long_and_random  
JWT_SECRET=a_very_secret_key_that_should_be_long_and_random  
JWT_ALGORITHM=HS256  
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# PostgreSQL 数据库

POSTGRES_HOST=localhost  
POSTGRES_PORT=5432  
POSTGRES_USER=postgres  
POSTGRES_PASSWORD=blockbond0!  
POSTGRES_DB=blockbond

# Elasticsearch

ES_HOST=localhost  
ES_PORT=9200  
ES_INDEX_NAME=main_index

# Qdrant

QDRANT_HOST=localhost  
QDRANT_PORT=6333  
QDRANT_COLLECTION=main_index  
QDRANT_BATCH_SIZE=32

# MinIO

MINIO_ENDPOINT=localhost:9000  
MINIO_ACCESS_KEY=minioadmin  
MINIO_SECRET_KEY=minioadmin  
MINIO_BUCKET=blockbond  
UPLOAD_DIR=/data/uploads  
STATIC_URL_PREFIX=/static

# Redis（用于热词聚合与分布式限流）

REDIS_ENABLE=true  
REDIS_HOST=127.0.0.1  
REDIS_PORT=6379  
REDIS_DB=0  
REDIS_PASSWORD=

# 限流（按需调整）

RATELIMIT_AGENT_CHAT_PER_MINUTE=30  
RATELIMIT_AGENT_EMBEDDINGS_PER_MINUTE=60  
RATELIMIT_AGENT_RAG_PER_MINUTE=30

# ZhipuAI

ZHIPU_BASE_URL=https://open.bigmodel.cn/api/paas/v4/  
ZHIPU_API_KEY=e1821b5511b74f43981a88ebb274cc9a.Ngb44ANQZkkOIKPB  
ZHIPU_MODEL=glm-4.5-airx  
ZHIPU_EMBEDDING_MODEL=embedding-3  
ai_call_remote_enable = True

MODERATION_SEED_PATH=static/config/banwords.default.json

UPLOAD_MAX_SIZE_BYTES=10485760  
UPLOAD_ALLOWED_CONTENT_TYPES=image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain
```
