package com.callflow.api.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class AvatarStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void storesSupportedImageAndReturnsSafeFilename() throws Exception {
        AvatarStorageService service = new AvatarStorageService(tempDir.toString());
        ByteArrayOutputStream imageBytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", imageBytes);
        MockMultipartFile file = new MockMultipartFile(
                "avatar", "avatar.png", "image/png",
                imageBytes.toByteArray()
        );

        String filename = service.replaceAvatar(file, null);

        assertTrue(filename.endsWith(".png"));
        assertTrue(filename.matches("[a-f0-9-]+\\.png"));
        assertTrue(Files.exists(tempDir.resolve(filename)));

        User user = new User("Test", "test@example.com", "hash");
        user.setAvatarFilename(filename);
        UserService userService = new UserService(
                mock(UserRepository.class),
                mock(org.springframework.security.crypto.password.PasswordEncoder.class),
                mock(com.callflow.api.security.JwtTokenProvider.class),
                service
        );
        assertEquals("/api/users/avatars/" + filename, userService.getAvatarUrl(user));
    }

    @Test
    void rejectsUnsupportedContentAndOversizedFile() {
        AvatarStorageService service = new AvatarStorageService(tempDir.toString());

        MockMultipartFile text = new MockMultipartFile(
                "avatar", "avatar.jpg", "image/jpeg", "not-an-image".getBytes()
        );
        assertThrows(IllegalArgumentException.class, () -> service.replaceAvatar(text, null));

        MockMultipartFile oversized = new MockMultipartFile(
                "avatar", "avatar.jpg", "image/jpeg",
                new byte[2 * 1024 * 1024 + 1]
        );
        assertThrows(IllegalArgumentException.class, () -> service.replaceAvatar(oversized, null));
    }
}
