package com.example.springboot.hospitalManagement.service;

import com.example.springboot.hospitalManagement.Entity.Insurance;
import com.example.springboot.hospitalManagement.Entity.Patient;

public interface InsuranceService {

    Patient assignInsuranceToPatient(Insurance insurance, Long patientId);
    Patient removeInsurance(Long patientId);

}