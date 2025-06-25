# 🚀 Guía Completa - Sistema de Eventos Core

## 📋 Índice Rápido
- [🏗️ Arquitectura](#arquitectura) - Cómo está organizado todo
- [📝 Formato de Eventos](#formato) - Cómo se envían/reciben datos
- [🔐 Autenticación](#autenticación) - Cómo nos conectamos al Core
- [📤 Enviar Eventos](#envío) - Cómo mandamos datos al Core
- [📥 Recibir Eventos](#recepción) - Cómo nos llegan datos del Core
- [🧪 Testing](#testing) - Cómo probar todo
- [👥 Para Nuevos Dev](#guía-desarrolladores) - Cómo crear tu propia área
- [🎯 Casos Reales](#casos-uso) - Ejemplos del mundo real

---

## 🏗️ Arquitectura General {#arquitectura}

```
┌─────────────────────────────────────────────────────────────────┐
│                    TU APLICACIÓN                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📤 ENVÍO: Frontend → Controller → Publisher → Core             │
│                                ↓                                │
│                         🌐 CORE HUB                             │
│                    (hub.deliver.ar)                             │
│                                ↓                                │
│  📥 RECEPCIÓN: Core → Callback → Service → BD + WebSocket       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Estructura de Archivos (Modular)**
```
📁 Tu área (Billetera):
├── WalletEventPublisher.java      ← Tu lógica de envío
├── WalletEventController.java     ← Tu API (/api/wallet/events/*)

📁 Compañero A (Pedidos):
├── PedidoEventPublisher.java      ← Su lógica de envío  
├── PedidoEventController.java     ← Su API (/api/pedido/events/*)

📁 Núcleo común (todos usan):
├── EventosCorePublishService.java ← Servicio base
├── EventosCoreService.java        ← Lógica de recepción
├── CallbackController.java        ← Recibe del Core
```

---

## 📝 Formato Correcto de Eventos {#formato}

### **🚨 REGLA ÚNICA**
**TODOS** los eventos (envío y recepción) usan este formato:

```json
{
  "topic": "nombre.del.evento",
  "payload": {
    "cualquier": "dato",
    "que": "necesites"
  }
}
```

### **Ejemplos Prácticos**

#### **📤 Enviando al Core:**
```json
{
  "topic": "saldo.intencion_carga",
  "payload": {
    "userId": "123",
    "monto": 1000,
    "metodoPago": "MercadoPago"
  }
}
```

#### **📥 Recibiendo del Core:**
```json
{
  "topic": "saldo.actualizado", 
  "payload": {
    "userId": "123",
    "nuevoSaldo": 2500.50,
    "timestamp": 1640995200000
  }
}
```

**💡 Tip:** El `payload` puede contener lo que quieras. Es nuestra responsabilidad ponernos de acuerdo con otros módulos sobre qué datos vamos a enviar o recibir.

---

## 🔐 Autenticación {#autenticación}

### **Cómo Funciona**
El Core Hub requiere autenticación. Nuestro sistema se encarga **automáticamente**:

```
1. Intentas enviar evento
2. Sistema verifica si hay token válido
3. Si no hay → Login automático
4. Si hay → Usa el token
5. Si expira → Renueva automáticamente
```

### **Configuración**
```properties
# application.properties
core.hub.url=https://hub.deliver.ar
core.auth.username=cliente-service
core.auth.password=123456
```

### **Para Testing**
```bash
# Ver estado del token
curl http://localhost:8080/api/core-auth/check

# Forzar login manual
curl -X POST http://localhost:8080/api/core-auth/login
```

**🎯 Lo importante:** No tienes que preocuparte por tokens. El sistema se encarga de todo.

---

## 📤 Envío de Eventos (Nosotros → Core) {#envío}

### **Tu Publisher (Ejemplo: Billetera)**

```java
@Service
@RequiredArgsConstructor
public class WalletEventPublisher {
    private final EventosCorePublishService corePublishService;
    
    public boolean notificarCargaSaldo(String userId, Double monto) {
        PublishEventRequestDto evento = PublishEventRequestDto.builder()
            .topic("saldo.intencion_carga")
            .payload(Map.of(
                "userId", userId,
                "monto", monto,
                "timestamp", System.currentTimeMillis()
            ))
            .build();
            
        return corePublishService.publicarEvento(evento);
    }
}
```

### **Tu Controlador (Endpoints Reales)**

```java
@RestController
@RequestMapping("/api/wallet/events")
@RequiredArgsConstructor
public class WalletEventController {
    private final WalletEventPublisher walletEventPublisher;
    
    @PostMapping("/saldo/intencion-carga")
    public ResponseEntity<?> notificarIntencionCarga(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        Double monto = Double.valueOf(request.get("monto").toString());
        String metodoPago = (String) request.getOrDefault("metodoPago", "MercadoPago");
        
        boolean exito = walletEventPublisher.notificarIntencionCargaSaldo(userId, monto, metodoPago);
        
        return ResponseEntity.ok(Map.of("success", exito));
    }
    
    @PostMapping("/crypto/solicitar-precio")
    public ResponseEntity<?> solicitarPrecioCrypto(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        String tipoMoneda = (String) request.getOrDefault("tipoMoneda", "BTC");
        
        boolean exito = walletEventPublisher.solicitarPrecioCrypto(userId, tipoMoneda);
        
        return ResponseEntity.ok(Map.of("success", exito));
    }
}
```


### **Testing (Endpoints Reales)**
```bash
# Notificar intención de carga de saldo
curl -X POST http://localhost:8080/api/wallet/events/saldo/intencion-carga \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "saldo.intencion_carga",
    "payload": {
      "userId": "123", 
      "monto": 1000, 
      "metodoPago": "MercadoPago"
    }
  }'

# Solicitar precio de crypto
curl -X POST http://localhost:8080/api/wallet/events/crypto/solicitar-precio \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "crypto.solicitar_precio",
    "payload": {
      "userId": "123", 
      "tipoMoneda": "BTC"
    }
  }'

# Notificar intención de compra crypto
curl -X POST http://localhost:8080/api/wallet/events/crypto/intencion-compra \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "crypto.intencion_compra",
    "payload": {
      "userId": "123", 
      "tipoMoneda": "BTC", 
      "montoEnPesos": 50000, 
      "cantidadCrypto": 0.001
    }
  }'
```

---

## 📥 Recepción de Eventos (Core → Nosotros) {#recepción}

### **Cómo Llegan los Eventos**
```
Core Hub → CallbackController → EventosCoreService → BD + WebSocket → Frontend
```

### **1. Callback (Recibe del Core)**
```java
@PostMapping("/api/callback")
public ResponseEntity<Void> recibirEvento(@RequestBody Map<String, Object> eventoData) {
    String topic = (String) eventoData.get("topic");
    Map<String, Object> payload = (Map<String, Object>) eventoData.get("payload");
    
    eventosCoreService.procesarEventoRecibido(topic, payload);
    return ResponseEntity.noContent().build();
}
```

### **2. Persistencia (Solo Último Estado)**
```java
@Entity
public class EventosCore {
    private String topic;           // "saldo.actualizado"
    private String userId;          // "123"
    private String eventData;       // JSON del payload
    private Boolean isLatest;       // Solo el último por topic/usuario
}
```

**💡 Estrategia:** Solo guardamos el último evento por topic/usuario. No acumulamos basura.

### **3. Frontend (JavaScript)**
```javascript
class EventosCoreManager {
    constructor(userId) {
        this.userId = userId;
        this.websocket = new WebSocket(`ws://localhost:8080/ws/order-tracking?userId=${userId}`);
    }
    
    onEvento(topic, callback) {
        this.eventHandlers[topic] = callback;
    }
}

// Uso:
const eventos = new EventosCoreManager("123");
eventos.onEvento('saldo.actualizado', (data) => {
    document.getElementById('saldo').textContent = `$${data.nuevoSaldo}`;
});
```

---

## 🧪 Testing Completo {#testing}

### **1. Probar Autenticación**
```bash
# Ver si hay token
curl http://localhost:8080/api/core-auth/check

# Forzar login
curl -X POST http://localhost:8080/api/core-auth/login
```

### **2. Probar Envío de Eventos**
```bash
# Notificar intención de carga de saldo
curl -X POST http://localhost:8080/api/wallet/events/saldo/intencion-carga \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "saldo.intencion_carga",
    "payload": {
      "userId": "123", 
      "monto": 1000, 
      "metodoPago": "MercadoPago"
    }
  }'

# Solicitar precio de crypto
curl -X POST http://localhost:8080/api/wallet/events/crypto/solicitar-precio \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "crypto.solicitar_precio",
    "payload": {
      "userId": "123", 
      "tipoMoneda": "BTC"
    }
  }'
```

### **3. Simular Eventos del Core**
```bash
# Simular evento de saldo (solo WalletEventHandler lo procesará)
curl -X POST http://localhost:8080/api/callback \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "saldo.actualizado",
    "payload": {
      "userId": "123",
      "nuevoSaldo": 2500.50,
      "tipoTransaccion": "CARGA_SALDO"
    }
  }'

# Simular evento de pedido (solo PedidoEventHandler lo procesará)
curl -X POST http://localhost:8080/api/callback \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "pedido.recibido",
    "payload": {
      "userId": "123",
      "pedidoId": "PED-456",
      "restaurante": "La Pizzería",
      "total": 1200.0
    }
  }'

# Simular evento desconocido (solo procesamiento genérico)
curl -X POST http://localhost:8080/api/callback \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "evento.desconocido",
    "payload": {
      "userId": "123",
      "datos": "genéricos"
    }
  }'
```

### **4. Probar Reconexión**
```bash
# Solicitar eventos actuales (cuando usuario abre app)
curl -X POST http://localhost:8080/api/eventos-core/reenviar/123
```

---

## 👥 Guía para Desarrolladores {#guía-desarrolladores}

### **Paso 1: Crear tu Publisher**
```java
@Service
@RequiredArgsConstructor
public class MiAreaEventPublisher {
    private final EventosCorePublishService corePublishService;
    
    public boolean miMetodo(String userId, String dato) {
        PublishEventRequestDto evento = PublishEventRequestDto.builder()
            .topic("mi_area.mi_evento")
            .payload(Map.of("userId", userId, "dato", dato))
            .build();
            
        return corePublishService.publicarEvento(evento);
    }
}
```

### **Paso 2: Crear tu Controlador**
```java
@RestController
@RequestMapping("/api/mi-area/events")
@RequiredArgsConstructor
public class MiAreaEventController {
    private final MiAreaEventPublisher publisher;
    
    @PostMapping("/mi-endpoint")
    public ResponseEntity<?> miEndpoint(@RequestBody Map<String, Object> request) {
        boolean exito = publisher.miMetodo(
            (String) request.get("userId"),
            (String) request.get("dato")
        );
        return ResponseEntity.ok(Map.of("success", exito));
    }
}
```

### **Paso 3: Agregar Permisos**
```java
// En SecurityConfig.java:
.requestMatchers("/api/mi-area/events/**").permitAll()
```

### **Paso 4: Testear**
```bash
curl -X POST http://localhost:8080/api/mi-area/events/mi-endpoint \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "mi_area.mi_evento",
    "payload": {
      "userId": "123", 
      "dato": "valor"
    }
  }'
```

**🎯 ¡Listo!** Ahora tienes tu propia área sin tocar código de otros.

---

## 🎯 Casos de Uso Reales {#casos-uso}

### **Caso 1: Usuario Carga Saldo**

```
1. Usuario ingresa $1000 en tu frontend
2. Frontend → POST /api/wallet/events/saldo/intencion-carga
3. WalletEventPublisher → Core Hub (con auth automática)
4. Core Hub → Módulo de Pagos
5. Módulo de Pagos procesa → Core Hub
6. Core Hub → POST /api/callback (tu backend)
7. EventosCoreService → BD + WebSocket
8. Frontend recibe evento → UI actualizada
9. Usuario ve su nuevo saldo INMEDIATAMENTE
```

### **Caso 2: Usuario Cierra y Abre App**

```
1. Usuario cierra app → WebSocket desconectado
2. (Mientras tanto) Core envía eventos → Se guardan en BD
3. Usuario abre app 2 horas después
4. Frontend conecta → Solicita eventos actuales
5. Backend consulta BD → Solo eventos "latest"
6. Backend reenvía TODO por WebSocket
7. Frontend → UI completamente actualizada
8. Usuario ve TODO al día (saldo, precios, etc.)
```

---

## 🎯 Filtrado por Topic (OPCIONAL - Solo si necesitas lógica extra backend)

### **🤔 ¿Cuándo usar esto?**
- ✅ **SÍ usar** si necesitas lógica específica backend (cache, notificaciones, validaciones)
- ❌ **NO usar** si solo vas a mostrar datos en frontend (déjalo que filtre el frontend)

### **El Problema**
Todos los eventos llegan al mismo endpoint `/api/callback`, pero cada área podría necesitar procesar solo SUS eventos con lógica específica:
- **Billetera**: `saldo.actualizado` → Actualizar cache local + validar límites
- **Pedidos**: `pedido.recibido` → Notificar restaurante + iniciar tracking  
- **Etc.**

### **✅ Solución: Sistema de Handlers (Map en Memoria)**

#### **1. Implementación Técnica en EventosCoreService**
```java
@Service
@RequiredArgsConstructor
public class EventosCoreService {
    // Map en memoria: topic → lista de handlers
    private final Map<String, List<BiConsumer<String, Map<String, Object>>>> topicHandlers = new ConcurrentHashMap<>();
    
    // Método para registrar handlers (llamado desde cada área)
    public void registrarHandler(String topic, BiConsumer<String, Map<String, Object>> handler) {
        topicHandlers.computeIfAbsent(topic, k -> new ArrayList<>()).add(handler);
        log.info("📝 Handler registrado para topic: {}", topic);
    }
    
    // Método principal de procesamiento
    public void procesarEventoRecibido(CallbackRequestDto callbackRequest) {
        String topic = callbackRequest.getTopic();
        Map<String, Object> payload = callbackRequest.getPayload();
        String userId = payload.get("userId") != null ? payload.get("userId").toString() : null;
        
        // 1. EJECUTAR HANDLERS ESPECÍFICOS (si existen)
        List<BiConsumer<String, Map<String, Object>>> handlers = topicHandlers.get(topic);
        if (handlers != null && !handlers.isEmpty()) {
            log.info("🎯 Ejecutando {} handlers para topic: {}", handlers.size(), topic);
            handlers.forEach(handler -> {
                try {
                    handler.accept(userId, payload);
                } catch (Exception e) {
                    log.error("❌ Error en handler para topic {}: {}", topic, e.getMessage());
                }
            });
        } else {
            log.info("ℹ️ Sin handlers específicos para topic: {}", topic);
        }
        
        // 2. PERSISTIR EN BD (siempre)
        persistirEvento(callbackRequest);
        
        // 3. ENVIAR POR WEBSOCKET (siempre - sin filtrado)
        enviarPorWebSocket(callbackRequest, userId);
    }
}
```

#### **2. Cada área crea su Handler**
```java
@Service
@RequiredArgsConstructor
public class WalletEventHandler {
    private final EventosCoreService eventosCoreService;
    private final RedisTemplate<String, Object> redisTemplate; // Ejemplo: cache
    private final EmailService emailService; // Ejemplo: notificaciones
    
    @PostConstruct
    public void registrarHandlers() {
        // Solo registras los topics que TE interesan
        eventosCoreService.registrarHandler("saldo.actualizado", this::manejarSaldoActualizado);
        eventosCoreService.registrarHandler("crypto.precio_actualizado", this::manejarPrecioCrypto);
        eventosCoreService.registrarHandler("transaccion.fallida", this::manejarTransaccionFallida);
    }
    
    private void manejarSaldoActualizado(String userId, Map<String, Object> payload) {
        Double nuevoSaldo = ((Number) payload.get("nuevoSaldo")).doubleValue();
        log.info("💰 [BILLETERA] Saldo actualizado para user {}: ${}", userId, nuevoSaldo);
        
        // Tu lógica específica:
        // 1. Actualizar cache Redis
        redisTemplate.opsForValue().set("saldo:" + userId, nuevoSaldo);
        
        // 2. Validar límites
        if (nuevoSaldo > 100000) {
            log.warn("⚠️ Usuario {} superó límite de saldo: ${}", userId, nuevoSaldo);
        }
        
        // 3. Enviar notificación por email si es carga importante
        if (nuevoSaldo > 50000) {
            emailService.enviarNotificacionSaldo(userId, nuevoSaldo);
        }
    }
    
    private void manejarTransaccionFallida(String userId, Map<String, Object> payload) {
        String motivo = (String) payload.get("motivo");
        log.error("❌ [BILLETERA] Transacción fallida para user {}: {}", userId, motivo);
        
        // Lógica específica para fallos
        emailService.enviarNotificacionError(userId, motivo);
    }
}
```

#### **3. Tu compañero crea SU Handler (independiente)**
```java
@Service
@RequiredArgsConstructor
public class PedidoEventHandler {
    private final EventosCoreService eventosCoreService;
    private final RestauranteNotificationService restauranteService;
    private final PedidoTrackingService trackingService;
    
    @PostConstruct
    public void registrarHandlers() {
        // Solo registra los topics que LE interesan
        eventosCoreService.registrarHandler("pedido.recibido", this::manejarPedidoRecibido);
        eventosCoreService.registrarHandler("pedido.estado_actualizado", this::manejarEstadoPedido);
    }
    
    private void manejarPedidoRecibido(String userId, Map<String, Object> payload) {
        String pedidoId = (String) payload.get("pedidoId");
        String restaurante = (String) payload.get("restaurante");
        log.info("🍕 [PEDIDOS] Nuevo pedido {} para user {} en {}", pedidoId, userId, restaurante);
        
        // Su lógica específica:
        // 1. Notificar al restaurante
        restauranteService.notificarNuevoPedido(restaurante, pedidoId);
        
        // 2. Iniciar tracking automático
        trackingService.iniciarTracking(pedidoId, userId);
        
        // 3. Programar recordatorio si no se acepta en 5 min
        trackingService.programarRecordatorio(pedidoId, Duration.ofMinutes(5));
    }
}
```

### **🌐 WebSocket: ¡IMPORTANTE! Sin Filtrado Automático**

#### **❗ Cómo Funciona Realmente:**
```java
// En EventosCoreService.enviarPorWebSocket()
public void enviarPorWebSocket(CallbackRequestDto evento, String userId) {
    if (userId != null) {
        // Envía a usuario específico (si viene userId en payload)
        webSocketService.sendToUser(userId, evento);
    } else {
        // Envía a TODOS los conectados (broadcast)
        webSocketService.sendToAll(evento);
    }
    
    // ⚠️ NO HAY FILTRADO POR TOPIC - Llega todo al frontend
}
```

#### **✅ Responsabilidades:**
- **Backend Handler**: Lógica específica (cache, validaciones, notificaciones)
- **WebSocket**: Transporta TODO al frontend (sin filtrar)
- **Frontend**: Decide qué mostrar según el topic del evento

### **🔄 Flujo Completo con Handlers**
```
1. Core → POST /api/callback {"topic": "saldo.actualizado", "payload": {...}}
2. CallbackController → EventosCoreService.procesarEventoRecibido()
3. EventosCoreService → Busca handlers para "saldo.actualizado"
4. EventosCoreService → Ejecuta WalletEventHandler.manejarSaldoActualizado()
   └── Actualiza cache Redis
   └── Valida límites  
   └── Envía email si corresponde
5. EventosCoreService → Persiste en BD (siempre)
6. EventosCoreService → Envía por WebSocket (siempre, sin filtrar)
7. Frontend recibe evento → Filtra por topic → Actualiza UI relevante
```

### **🎯 Ventajas del Sistema**
- ✅ **Cero conflictos** → Cada uno en sus archivos
- ✅ **Filtrado automático** → Solo ejecuta TUS handlers
- ✅ **Lógica específica** → Cache, validaciones, notificaciones
- ✅ **Frontend flexible** → Recibe todo, decide qué mostrar
- ✅ **Fácil de testear** → Simular solo TUS topics
- ✅ **Escalable** → Nuevas áreas = Nuevos handlers

### **📝 Cuándo NO Usarlo**
Si tu única necesidad es **mostrar datos en el frontend**, no necesitas handlers:
```javascript
// Frontend - Filtrado simple sin backend handlers
websocket.onmessage = (event) => {
    const evento = JSON.parse(event.data);
    
    if (evento.topic === 'saldo.actualizado') {
        // Actualizar UI de saldo
        updateSaldoUI(evento.payload.nuevoSaldo);
    } else if (evento.topic === 'pedido.recibido') {
        // Tu compañero maneja esto
        // Tu no haces nada
    }
};
```

