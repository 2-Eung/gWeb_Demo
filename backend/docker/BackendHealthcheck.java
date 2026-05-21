import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;

public final class BackendHealthcheck {

    private BackendHealthcheck() {
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        if (args.length != 1) {
            System.exit(1);
        }

        URI target = URI.create(args[0]);
        HttpURLConnection connection = (HttpURLConnection) target.toURL().openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(2000);
        connection.setReadTimeout(2000);

        try {
            int statusCode = connection.getResponseCode();
            if (statusCode >= 200 && statusCode < 400) {
                System.exit(0);
            }
            System.exit(1);
        } finally {
            connection.disconnect();
        }
    }
}
