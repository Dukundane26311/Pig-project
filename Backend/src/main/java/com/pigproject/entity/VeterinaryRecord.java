package com.pigproject.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "veterinary_records")
public class VeterinaryRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pig_id")
    private Pig pig;

    @ManyToOne
    @JoinColumn(name = "beneficiary_id")
    private Beneficiary beneficiary;

    @ManyToOne
    @JoinColumn(name = "veterinarian_id")
    private User veterinarian;

    private LocalDateTime examinationDate;

    private String healthStatus;
    private BigDecimal weight;
    private String diagnosis;
    private String treatment;
    private String medication;
    private String vaccination;
    private String pregnancyStatus;
    private String notes;
    private LocalDateTime nextVisitDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
