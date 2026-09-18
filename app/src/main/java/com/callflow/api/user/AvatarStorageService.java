package com.callflow.api.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class AvatarStorageService {

    private static final long MAX_AVATAR_SIZE = 2 * 1024 * 1024;

    private final Path storageDirectory;

    public AvatarStorageService(@Value("${avatar.storage-dir:/data/avatars}") String storageDirectory) {
        this.storageDirectory = Path.of(storageDirectory).toAbsolutePath().normalize();
    }

    public String replaceAvatar(MultipartFile file, String previousFilename) {
        validate(file);

        try {
            Files.createDirectories(storageDirectory);
            String extension = detectExtension(file);
            String filename = UUID.randomUUID() + extension;
            Path target = storageDirectory.resolve(filename).normalize();

            if (!target.getParent().equals(storageDirectory)) {
                throw new IllegalArgumentException("Некорректное имя файла");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return filename;
        } catch (IOException e) {
            throw new IllegalStateException("Не удалось сохранить аватар", e);
        }
    }

    public byte[] read(String filename) {
        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("Файл аватара не найден");
        }

        Path path = storageDirectory.resolve(filename).normalize();
        if (!path.getParent().equals(storageDirectory)) {
            throw new IllegalArgumentException("Некорректное имя файла");
        }

        try {
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new IllegalArgumentException("Файл аватара не найден", e);
        }
    }

    public String getContentType(String filename) {
        String lower = filename.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        return "image/jpeg";
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Выберите файл аватара");
        }
        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw new IllegalArgumentException("Аватар должен быть размером не более 2 МБ");
        }
        if (!isSupportedImage(file)) {
            throw new IllegalArgumentException("Поддерживаются только JPG, PNG и GIF");
        }
    }

    private boolean isSupportedImage(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = inputStream.readNBytes(12);
            if (!(isJpeg(header) || isPng(header) || isGif(header))) {
                return false;
            }
            try (InputStream imageInput = file.getInputStream()) {
                return ImageIO.read(imageInput) != null;
            }
        } catch (IOException e) {
            return false;
        }
    }

    private String detectExtension(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = inputStream.readNBytes(12);
            if (isPng(header)) return ".png";
            if (isGif(header)) return ".gif";
            return ".jpg";
        } catch (IOException e) {
            throw new IllegalArgumentException("Не удалось определить формат аватара", e);
        }
    }

    private boolean isJpeg(byte[] header) {
        return header.length >= 3
                && (header[0] & 0xff) == 0xff
                && (header[1] & 0xff) == 0xd8
                && (header[2] & 0xff) == 0xff;
    }

    private boolean isPng(byte[] header) {
        byte[] signature = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};
        return startsWith(header, signature);
    }

    private boolean isGif(byte[] header) {
        return startsWith(header, "GIF87a".getBytes()) || startsWith(header, "GIF89a".getBytes());
    }

    private boolean startsWith(byte[] value, byte[] prefix) {
        if (value.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (value[i] != prefix[i]) return false;
        }
        return true;
    }

    private void delete(String filename) {
        if (filename == null || filename.isBlank()) return;
        Path path = storageDirectory.resolve(filename).normalize();
        if (path.getParent().equals(storageDirectory)) {
            try {
                Files.deleteIfExists(path);
            } catch (IOException ignored) {
                // A failed cleanup must not invalidate a successfully stored replacement.
            }
        }
    }

    public void deletePrevious(String filename) {
        delete(filename);
    }
}
