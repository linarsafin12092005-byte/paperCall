# CallFlow — учебная production-like платформа контакт-центра

Pet-проект для практического изучения Java/Spring Boot, Docker, микросервисной инфраструктуры, event-driven архитектуры, телефонии (SIP/Asterisk), observability-стека и CI/CD. Цель — не просто "поднять сервисы", а собрать их в единую работающую систему и понять, как и почему они взаимодействуют друг с другом.

---

## 1. Общая архитектура

```
                              Client (Web/SIP)
                                    │
                                  Nginx  ── раздаёт React-фронтенд, проксирует /api на backend
                                    │
                              CallFlow API (Spring Boot)
                                    │
        ┌───────────┬──────────────┼──────────────┬────────────┐
        │           │              │              │            │
      MySQL       Redis          Kafka         Asterisk      Actuator
   (данные)    (кэш статусов)  (события)    (SIP/AMI)     (health/metrics)
                                    │
                              call-events topic
                                    │
                         (consumer: логирование/аналитика)

CallFlow ──► Prometheus ──► Grafana        (метрики JVM/HTTP/бизнес-логики)
CallFlow ──► OpenTelemetry ──► Jaeger      (distributed tracing запросов)
Все контейнеры ──► Filebeat ──► Elasticsearch ──► Kibana   (централизованные логи)

Developer ──► Gitea (git) ──► Jenkins (CI/CD) ──► Docker Registry ──► Deploy
                                                                          │
                                                                     Kubernetes (Minikube)
```

---

## 2. Технологический стек и назначение каждого компонента

| Компонент | Роль | Зачем именно он |
|---|---|---|
| **Java 21 + Spring Boot 4.0** | Backend-фреймворк | Промышленный стандарт для enterprise Java; версия 4.0 — модуляризованная архитектура автоконфигураций (см. раздел "Особенности Spring Boot 4.0") |
| **MySQL 8.4** | Основная реляционная БД | Хранение операторов, клиентов, звонков — источник истины |
| **Redis 7.4** | In-memory кэш | Быстрый доступ к текущему статусу оператора без похода в MySQL при каждом запросе |
| **Apache Kafka** | Message broker | Событийная архитектура: `call.created`, `call.answered`, `call.finished` публикуются асинхронно, не блокируя основной поток запроса |
| **Nginx** | Reverse proxy | Единая точка входа, скрывает внутренние порты сервисов, отдаёт фронтенд |
| **React + Tailwind** | Frontend-дашборд | Визуализация операторов/клиентов/звонков в реальном времени |
| **Asterisk (PJSIP)** | VoIP PBX | Реальная SIP-телефония: регистрация SIP-аккаунтов, маршрутизация звонков |
| **Asterisk-Java (AMI)** | Java-клиент для Asterisk Manager Interface | Мост между телефонией и приложением: Spring Boot слушает события звонков в реальном времени |
| **Prometheus + Grafana** | Метрики и дашборды | Мониторинг JVM (память, GC, потоки), HTTP-запросов, бизнес-метрик |
| **OpenTelemetry + Jaeger** | Distributed tracing | Визуализация полного пути запроса через все компоненты, поиск задержек |
| **Elasticsearch + Kibana + Filebeat** | Централизованные логи | Сбор и поиск логов со всех контейнеров в одном месте *(см. известное ограничение ниже)* |
| **Gitea** | Self-hosted Git | Приватный репозиторий, независимость от внешних сервисов |
| **Jenkins** | CI/CD оркестратор | Автоматизация: checkout → build → docker build → push → deploy |
| **Docker Registry** | Приватный registry образов | Упрощённая замена Harbor — та же суть (хранение и раздача Docker-образов), без лишнего веса RBAC/UI для pet-проекта |
| **Kubernetes (Minikube)** | Оркестрация контейнеров | Self-healing, декларативное управление, отдельный слой поверх Docker Compose для сравнения подходов |

---

## 3. Структура репозитория

```
paperCall/
├── app/                      Spring Boot приложение (Java 21, Maven)
│   ├── src/main/java/com/callflow/api/
│   │   ├── operator/         Entity/Repository/Service/Controller оператора
│   │   ├── client/           Entity/Repository/Service/Controller клиента
│   │   ├── call/             Entity/Repository/Service/Controller звонка
│   │   ├── event/            CallEvent, CallEventProducer, CallEventConsumer (Kafka)
│   │   ├── asterisk/         AsteriskAmiListener — мост Asterisk AMI → Kafka
│   │   └── config/           RedisConfig и прочие бины конфигурации
│   └── src/main/resources/application.properties
├── frontend/                 React + Vite + Tailwind дашборд
├── nginx.conf                Конфигурация reverse proxy
├── prometheus.yml            Конфигурация сборщика метрик
├── filebeat.yml              Конфигурация сборщика логов
├── asterisk/conf/            manager.conf, pjsip.conf, extensions.conf
├── k8s/                      Kubernetes-манифесты (mysql.yaml, api.yaml)
├── Jenkinsfile                Pipeline-as-code для CI/CD
├── Dockerfile                 Сборка образа callflow-api
└── docker-compose.yml         Оркестрация всех сервисов
```

---

## 4. Как запускать — по группам, с учётом ограничения по памяти

**Важно:** проект разрабатывался на ноутбуке с 8ГБ ОЗУ. Одновременный запуск всех ~17 сервисов физически не помещается в память. Поэтому сервисы разделены на Docker Compose **profiles**, и запускаются по группам под конкретную задачу.

### 4.1 Базовый рабочий стек (backend + телефония)

Это основной, повседневный набор — сюда входит всё, что нужно для разработки и демонстрации основной функциональности:

```bash
cd ~/projects/paperCall
docker compose up -d mysql redis kafka api nginx frontend asterisk kafka-ui
```

Проверка:
```bash
docker compose ps -a
curl http://localhost/api/operators
```

Открыть:
- Фронтенд: **http://localhost/**
- Kafka UI (просмотр топика `call-events`): **http://localhost:8081**

### 4.2 Observability-стек (Prometheus/Grafana/Jaeger)

Поднимается отдельно, когда нужно посмотреть метрики или трейсы:

```bash
docker compose up -d prometheus grafana jaeger
```

- Prometheus: **http://localhost:9090**
- Grafana: **http://localhost:3000** (admin/admin)
- Jaeger UI: **http://localhost:16686**

Останавливать после использования, чтобы освободить память:
```bash
docker compose stop prometheus grafana jaeger
```

### 4.3 ELK-стек (логи)

```bash
docker compose up -d elasticsearch
# подождать 60-90 секунд, пока Elasticsearch полностью стартует
docker compose up -d kibana filebeat
```

Kibana: **http://localhost:5601**

⚠️ **Известное ограничение**: на Docker Desktop (Windows/WSL2) реальные лог-файлы контейнеров физически хранятся во внутренней виртуальной машине Docker Desktop, а не в файловой системе WSL/хоста по стандартному пути `/var/lib/docker/containers`. Из-за этого Filebeat не может прочитать логи через файловый доступ, даже если Elasticsearch и сетевое соединение между всеми компонентами работают полностью корректно (что было подтверждено отдельно). Конфигурация ELK-стека (Elasticsearch + Kibana + Filebeat autodiscover) написана и технически верна — она заработала бы без модификаций на "чистом" Linux-сервере с классическим Docker Engine (например, на реальном VPS). Это архитектурное ограничение конкретно среды разработки, а не ошибка конфигурации.

Останавливать после использования:
```bash
docker compose stop elasticsearch kibana filebeat
```

### 4.4 CI/CD-стек (Gitea/Jenkins/Registry)

```bash
docker compose up -d gitea jenkins registry
```

- Gitea: **http://localhost:3001**
- Jenkins: **http://localhost:8082**
- Registry API: `curl http://localhost:5000/v2/_catalog`

Останавливать после использования:
```bash
docker compose stop gitea jenkins registry
```

### 4.5 Полная остановка всего

```bash
docker compose down
```

---

## 5. Ключевые архитектурные решения и «зачем»

### 5.1 Redis — кэш статусов оператора

При каждой смене статуса оператора (`CallService.updateStatus`) запись обновляется **одновременно** в MySQL (источник истины, для истории) и в Redis (быстрый доступ). Эндпоинт `/api/operators/{id}/status/cached` читает именно из Redis, минуя БД — имитация того, как в реальном контакт-центре фронтенд быстро узнаёт, кто из операторов сейчас свободен, без нагрузки на основную БД при частых опросах.

### 5.2 Kafka — событийная архитектура звонков

`CallService` при создании/назначении/завершении звонка не просто меняет запись в БД — он публикует событие в топик `call-events` через `CallEventProducer`. Ключ сообщения — ID звонка, что гарантирует порядок событий **внутри одного звонка** (Kafka не гарантирует общий порядок across разных ключей, только per-partition при одинаковом ключе).

**Реальные звонки через Asterisk тоже публикуются в Kafka.** `AsteriskAmiListener` подписан на события AMI (`NewChannel`, `Dial`, `Hangup`) и транслирует их в те же типы событий (`CALL_STARTED`, `CALL_ANSWERED`, `CALL_FINISHED`), замыкая архитектуру: SIP-звонок → Asterisk → AMI → Kafka, независимо от того, был ли звонок инициирован через REST API или реальный телефон.

### 5.3 Особенности Spring Boot 4.0 (важно для повторяемости)

Spring Boot 4.0 радикально изменил модульную структуру по сравнению с 3.x:
- Автоконфигурации разбиты по отдельным модулям (например, автоконфигурация Kafka — отдельный артефакт `spring-boot-kafka`, не входящий в общий `spring-boot-autoconfigure`)
- Появился встроенный модуль `spring-boot-starter-opentelemetry`, конфигурируемый через нативные переменные окружения OpenTelemetry SDK (`OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT` и т.д.), а не только через Spring-специфичные свойства
- Названия некоторых стартеров изменились (например, `spring-boot-starter-webmvc` вместо привычного `spring-boot-starter-web`)

Если при добавлении новой зависимости Spring встречается ошибка `No qualifying bean` или автоконфигурация "не срабатывает" — проверяй, не нужен ли отдельный модуль автоконфигурации, специфичный для Spring Boot 4.0.

### 5.4 Asterisk + AMI

Выбран **AMI** (Asterisk Manager Interface) вместо более нового ARI — потому что AMI проще в освоении, имеет проверенную временем Java-библиотеку (`asterisk-java`), и полностью достаточен для целей проекта: слушать события звонков и связывать их с бизнес-логикой.

Тестовые SIP-аккаунты: `1001` / `1001pass` и `1002` / `1002pass`, dialplan в `asterisk/conf/extensions.conf` маршрутизирует звонки между ними напрямую.

**Проверено вживую**: реальный звонок между iPhone (Zoiper) и десктопом (MicroSIP) через Asterisk, с полным циклом событий, зафиксированных в логах API и в Kafka.

### 5.5 CI/CD пайплайн

`Jenkinsfile` описывает 5 стадий:
1. **Checkout** — клонирование кода из Gitea
2. **Build** — `./mvnw clean package` внутри контейнера Jenkins
3. **Docker Build** — сборка образа `callflow-api`
4. **Push to Registry** — загрузка образа в приватный registry
5. **Deploy** — пересоздание контейнера `callflow-api` из свежесобранного образа

Важный практический нюанс: Jenkins подключён к Docker через проброшенный `docker.sock` (паттерн "Docker-out-of-Docker") — то есть команды `docker build/push` выполняются не изнутри самого контейнера Jenkins, а делегируются Docker-движку хоста. Отсюда следует, что адреса вида `localhost:5000` внутри Jenkinsfile ссылаются на хост, а не на другой контейнер по имени сервиса.

### 5.6 Kubernetes

Для баланса между полнотой демонстрации и ограничениями по памяти, в Kubernetes (через Minikube) перенесены только два ключевых сервиса — `api` и `mysql` — как учебная демонстрация Deployments, Services и Secrets, включая наблюдение self-healing (Kubernetes сам перезапускал под API, пока MySQL не был готов принимать соединения).

---

## 6. Проверка сквозного сценария (end-to-end smoke test)

```bash
# 1. Базовый стек
docker compose up -d mysql redis kafka api nginx frontend asterisk kafka-ui

# 2. Создать клиента
curl -X POST http://localhost/api/clients \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Client","phoneNumber":"+79990000000"}'

# 3. Создать звонок (замени clientId на реальный id из ответа выше)
curl -X POST "http://localhost/api/calls?clientId=1"

# 4. Назначить оператора и завершить (замени id звонка и оператора)
curl -X POST "http://localhost/api/calls/1/assign?operatorId=1"
curl -X POST "http://localhost/api/calls/1/finish"

# 5. Проверить событие в Kafka
docker compose logs api --tail 20 | grep "CallEvent received"
```

Если видно `type=CALL_CREATED`, `CALL_ANSWERED`, `CALL_FINISHED` — вся цепочка API → MySQL → Kafka работает.

---

## 7. Известные ограничения и осознанные упрощения

- **Harbor заменён на Docker Registry** — полноценный Harbor требует минимум 6 дополнительных сервисов (Postgres, Redis, core, portal, jobservice, registry), что физически не помещается в доступную память вместе с остальным стеком. Простой `registry:2` выполняет ту же ключевую функцию (хранение и раздача приватных образов) без RBAC/UI.
- **Kibana/Filebeat не визуализируют логи "из коробки" на Docker Desktop** — см. раздел 4.3. Инфраструктура написана корректно, ограничение — в среде выполнения.
- **Kubernetes-этап ограничен двумя сервисами** (`api`, `mysql`) вместо переноса всего стека — осознанное решение под ограничение памяти 8ГБ.
- **`xpack.security.enabled: false`** в Elasticsearch — отключение встроенной авторизации для простоты локальной разработки; в production обязательно включать.

---

## 8. Частые проблемы и их решения (из опыта разработки)

| Симптом | Причина | Решение |
|---|---|---|
| `Temporary failure in name resolution` при сборке Maven | DNS в WSL сбился | `sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'` |
| Docker не может скачать образ (`lookup ... on 127.0.0.53:53: server misbehaving`) | DNS Docker daemon сбился | Перезапустить Docker Desktop полностью |
| Контейнер `Exited`, `docker kill` не срабатывает | Нехватка ресурсов, зависший daemon | Перезапустить Docker Desktop через трей |
| `No qualifying bean of type 'KafkaTemplate'` | В Spring Boot 4.0 автоконфигурация Kafka — отдельный модуль | Добавить зависимость `spring-boot-kafka` (не только `spring-kafka`) |
| Jackson не сериализует `LocalDateTime` | Отсутствует модуль JSR310 | Добавить `jackson-datatype-jsr310` |
| Docker build падает с `buildkit ... 404` внутри Minikube | Экспериментальный containerd-режим buildx | `DOCKER_BUILDKIT=0 docker build ...` |
| Filebeat: `config file must be owned by root` | Файл конфига принадлежит обычному пользователю | `sudo chown root:root filebeat.yml && sudo chmod 644 filebeat.yml` |

---

## 9. Дальнейшие возможные улучшения

- Реальное чтение логов Filebeat на "чистом" Linux-сервере (VPS) вместо Docker Desktop
- Полноценный Harbor вместо простого Registry — при наличии более мощной машины
- Перенос всего стека в Kubernetes вместо двух сервисов
- Полноценный Zabbix для инфраструктурного мониторинга
- Alertmanager для Prometheus (уведомления в Telegram при аномалиях)
- HTTPS/TLS для Nginx и внутренних сервисов
- Horizontal Pod Autoscaler в Kubernetes для `callflow-api`

---

## 10. Итог

Этот проект — не набор изолированных демонстраций, а связанная система: реальный SIP-звонок через Asterisk запускает событие, которое летит в Kafka, видно в Kafka UI, отражается в метриках Prometheus, трассируется в Jaeger, и весь код, который это обеспечивает, проходит через настоящий CI/CD пайплайн от git push до передеплоя контейнера. Каждый компонент был не просто написан, а запущен и проверен вживую.