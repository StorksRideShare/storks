import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, CheckCircle2, XCircle, Plus, Calendar as CalendarIcon, GraduationCap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/axios";
import styles from "../../constants/AddChildScreenstyle";

// Validation Schema
const childSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 3 && Number(val) <= 18, {
    message: "Age must be between 3 and 18",
  }),
  grade: z.string().min(1, "Grade is required"),
  school: z.string().min(3, "Please specify a school"),
  pickupLocation: z.string().default("Home"),
  dropLocation: z.string().default(""),
});

type ChildFormValues = z.infer<typeof childSchema>;

const AddChildScreen = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(childSchema),
    defaultValues: {
      pickupLocation: "Home",
      firstName: "",
      lastName: "",
      age: "",
      grade: "",
      school: "",
    },
    mode: "onChange",
  } as const);

  const onSubmit = async (data: ChildFormValues): Promise<void> => {
    setIsSubmitting(true);
    try {
      const groupId = 1; // Assuming hardcoded group context
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        age: parseInt(data.age, 10),
        school: data.school,
        grade: parseInt(data.grade, 10),
        pickupLocation: data.pickupLocation,
        dropLocation: data.school,
      };

      await api.post(`/api/groups/${groupId}/children`, payload);
      
      Alert.alert("Success", "Child added successfully", [
        { text: "OK", onPress: () => router.replace("/groups") }
      ]);
    } catch (error) {
      console.error("Error adding child:", error);
      Alert.alert("Error", "Failed to add child. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#ff6a00" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Child Profile</Text>
        </View>

        <View style={{ padding: 16 }}>
          <Text style={styles.section}>Personal Information</Text>

          {/* First Name */}
          <View style={[styles.inputBox, errors.firstName && { borderColor: '#ff4444' }]}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="First name"
                  placeholderTextColor="#777"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
            {errors.firstName ? <XCircle color="#ff4444" size={18} /> : <CheckCircle2 color="#ff6a00" size={18} />}
          </View>
          {errors.firstName && <Text style={{ color: '#ff4444', fontSize: 12, marginLeft: 4 }}>{errors.firstName.message}</Text>}

          {/* Last Name */}
          <View style={[styles.inputBox, errors.lastName && { borderColor: '#ff4444' }]}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Last name"
                  placeholderTextColor="#777"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
            {errors.lastName ? <XCircle color="#ff4444" size={18} /> : <CheckCircle2 color="#ff6a00" size={18} />}
          </View>
          {errors.lastName && <Text style={{ color: '#ff4444', fontSize: 12, marginLeft: 4 }}>{errors.lastName.message}</Text>}

          {/* Age */}
          <View style={[styles.inputBox, errors.age && { borderColor: '#ff4444' }]}>
            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Age"
                  placeholderTextColor="#777"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />
            <CalendarIcon color="#ff6a00" size={18} />
          </View>
          {errors.age && <Text style={{ color: '#ff4444', fontSize: 12, marginLeft: 4 }}>{errors.age.message}</Text>}

          {/* Grade */}
          <View style={[styles.inputBox, errors.grade && { borderColor: '#ff4444' }]}>
            <Controller
              control={control}
              name="grade"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Grade"
                  placeholderTextColor="#777"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />
            <CheckCircle2 color="#ff6a00" size={18} />
          </View>
          {errors.grade && <Text style={{ color: '#ff4444', fontSize: 12, marginLeft: 4 }}>{errors.grade.message}</Text>}

          <Text style={styles.helper}>School Information</Text>

          {/* School */}
          <View style={[styles.inputBox, errors.school && { borderColor: '#ff4444' }]}>
            <Controller
              control={control}
              name="school"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="School Name"
                  placeholderTextColor="#777"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
            <GraduationCap color="#ff6a00" size={18} />
          </View>
          {errors.school && <Text style={{ color: '#ff4444', fontSize: 12, marginLeft: 4 }}>{errors.school.message}</Text>}

          {/* Options */}
          <TouchableOpacity style={styles.optionBtn} onPress={() => router.push('/children/CustomScheduleScreen')}>
            <Text style={styles.optionText}>Customize schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionBtn}>
            <Text style={styles.optionText}>Add Disabilities</Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity 
            style={[styles.submitBtn, (!isValid || isSubmitting) && { backgroundColor: '#555' }]} 
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>Add child profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddChildScreen;