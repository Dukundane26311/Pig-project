package com.pigproject.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pig_births")
public class PigBirth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "mother_pig_id")
    private Pig motherPig;

    private LocalDateTime birthDate;
    private Integer numberBorn;
    private Integer numberAlive;
    private Integer numberDead;
    private String notes;

    @ManyToOne
    @JoinColumn(name = "recorded_by_id")
    private User recordedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
