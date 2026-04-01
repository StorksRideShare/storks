package wdse17.bookingandpayment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "children")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Child {
    @Id
    @Column(name = "child_id")
    private UUID childId;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "preferred_name")
    private String preferredName;

    @Column(name = "grade")
    private String grade;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private ChildGroup childGroup;
}
