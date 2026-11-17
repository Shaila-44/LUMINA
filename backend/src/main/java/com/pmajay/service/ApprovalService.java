package com.pmajay.service;

import com.pmajay.model.Approval;
import com.pmajay.repository.ApprovalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApprovalService {

    @Autowired
    private ApprovalRepository approvalRepository;

    public List<Approval> getAll() {
        return approvalRepository.findAllByOrderBySubmittedAtDesc();
    }

    public List<Approval> getByStatus(Approval.ApprovalStatus status) {
        return approvalRepository.findByStatusOrderBySubmittedAtDesc(status);
    }

    public List<Approval> getByState(Long stateId) {
        return approvalRepository.findByAssignedState(stateId);
    }

    public List<Approval> getBySubmitter(Long userId) {
        return approvalRepository.findBySubmittedBy(userId);
    }

    public Approval create(Approval approval) {
        return approvalRepository.save(approval);
    }

    public Approval approve(Long id, Long reviewerId) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval not found: " + id));
        approval.setStatus(Approval.ApprovalStatus.APPROVED);
        approval.setReviewedAt(LocalDateTime.now());
        approval.setReviewedBy(reviewerId);
        return approvalRepository.save(approval);
    }

    public Approval reject(Long id, Long reviewerId) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval not found: " + id));
        approval.setStatus(Approval.ApprovalStatus.REJECTED);
        approval.setReviewedAt(LocalDateTime.now());
        approval.setReviewedBy(reviewerId);
        return approvalRepository.save(approval);
    }
}
