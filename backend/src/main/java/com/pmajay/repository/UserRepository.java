package com.pmajay.repository;

import com.pmajay.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    /** Used by DemoAuthController to find a demo user for a given role. */
    Optional<User> findFirstByRole(User.Role role);
    List<User> findByRole(User.Role role);
}
