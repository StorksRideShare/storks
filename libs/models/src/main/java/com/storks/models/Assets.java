package com.storks.models;

import com.storks.models.types.AssetType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "assets")
public class Assets {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID assetId;

    @Enumerated(EnumType.STRING)
    private AssetType type;

    private String assetUrl;
}
