package com.callflow.api.asterisk;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class TelephonyStatusService {
    private final boolean enabled;
    private final AtomicBoolean connected = new AtomicBoolean(false);

    public TelephonyStatusService(@Value("${asterisk.enabled:false}") boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isConnected() {
        return connected.get();
    }

    public void markConnected() {
        connected.set(true);
    }

    public void markDisconnected() {
        connected.set(false);
    }
}
