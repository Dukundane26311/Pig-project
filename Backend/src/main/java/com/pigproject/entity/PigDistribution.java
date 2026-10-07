package com.pigproject.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pig_distributions")
public class PigDistribution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pig_id")
    private Pig pig;

    @ManyToOne(optional = false)
    @JoinColumn(name = "beneficiary_id")
    private Beneficiary beneficiary;

    private LocalDateTime distributionDate;

    @ManyToOne
    @JoinColumn(name = "field_officer_id")
    private User fieldOfficer;

    private String location;
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
