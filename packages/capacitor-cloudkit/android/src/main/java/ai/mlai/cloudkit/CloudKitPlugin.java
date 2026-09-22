package ai.mlai.cloudkit;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * CloudKit is an Apple service. On Android the plugin is present and fails closed.
 */
@CapacitorPlugin(name = "CloudKit")
public class CloudKitPlugin extends Plugin {
    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", false);
        call.resolve(result);
    }

    @PluginMethod
    public void getAccountStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("status", "couldNotDetermine");
        call.resolve(result);
    }
}
