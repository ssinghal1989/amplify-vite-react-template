import { useCallback, useEffect, useState } from "react";
import { client, LocalSchema } from "../amplifyClient";
import { Tier1Score, useAppContext } from "../context/AppContext"; // adjust path
import { Tier1TemplateId } from "../services/defaultQuestions";

export function useAssessment() {
  const [userAssessments, setUserAssessments] = useState<Record<string, any>[]>(
    []
  );
  const [userTier1Assessments, setUserTier1Assessments] = useState<
    Record<string, any>[]
  >([]);
  const [submittingAssesment, setSubmittingAssesment] =
    useState<boolean>(false);
  const { dispatch, state } = useAppContext();

  useEffect(() => {
    if (!!state.loggedInUserDetails?.userId) {
      fetchUserAssessments();
    }
  }, [state.loggedInUserDetails?.userId]);

  useEffect(() => {
    if (userAssessments.length > 0) {
      const tier1Instances = (userAssessments ?? []).filter(
        (instance) => instance?.assessmentType === "TIER1"
      );
      setUserTier1Assessments(tier1Instances);
      if (tier1Instances.length > 0) {
        dispatch({
          type: "SET_TIER1_SCORE",
          payload:
            typeof tier1Instances[0]?.score === "string"
              ? (JSON.parse(tier1Instances[0]?.score) as Tier1Score)
              : null,
        });
      }
    }
  }, [userAssessments]);

  const fetchUserAssessments = useCallback(async () => {
    if (!state.loggedInUserDetails?.userId) return;

    try {
      const response = await client.models.User.get(
        {
          id: state.loggedInUserDetails?.userId,
        },
        {
          selectionSet: [
            "assessmentInstances.id",
            "assessmentInstances.templateId",
            "assessmentInstances.score",
            "assessmentInstances.responses",
            "assessmentInstances.companyId",
            "assessmentInstances.initiatorUserId",
            "assessmentInstances.assessmentType",
            "assessmentInstances.createdAt",
            "assessmentInstances.updatedAt",
          ],
        }
      );
      setUserAssessments(response?.data?.assessmentInstances || []);
    } catch (error) {
      console.error("Error fetching user assessments:", error);
    }
  }, [dispatch, state.loggedInUserDetails?.userId]);

  const submitTier1Assessment = useCallback(async ({user, company}: {user?: LocalSchema['User']['type']; company?: LocalSchema['Company']['type'];}) => {
    try {
      setSubmittingAssesment(true);
      if (
        !state.tier1Responses ||
        !state.tier1Score ||
        (!state.userData && !user) ||
        (!state.company && !company)
      ) {
        console.error("Data missing for submitting Tier 1 assessment");
        setSubmittingAssesment(false);
        return;
      }

      if (!!userTier1Assessments?.length) {
        // User already have submitted assessment for tier 1 update the first one.
        const updatedAssessmentData = {
          id: userTier1Assessments[0].id,
          score: JSON.stringify(state.tier1Score), // Store the score as JSON
          responses: JSON.stringify(state.tier1Responses), // Store the responses as JSON
        };
        await client.models.AssessmentInstance.update(updatedAssessmentData);
      } else {
        // Create a new assessment instance for user
        const assessmentData = {
          templateId: Tier1TemplateId, // Assuming a fixed template ID for Tier 1
          companyId: state.userData?.companyId || company?.id,
          initiatorUserId: state?.userData?.id || user?.id,
          assessmentType: "TIER1" as "TIER1",
          score: JSON.stringify(state.tier1Score), // Store the score as JSON
          responses: JSON.stringify(state.tier1Responses), // Store the responses as JSON
        };
        await client.models.AssessmentInstance.create(assessmentData);
      }
      setSubmittingAssesment(false);
    } catch (err) {
      setSubmittingAssesment(false);
      console.error("Error in submitting assessment");
    }
  }, [dispatch, state]);

  const updateTier1AssessmentResponse = useCallback(
    async ({
      assessmentId,
      updatedResponses,
      updatedScores,
    }: {
      assessmentId: string;
      updatedResponses: any;
      updatedScores: Tier1Score
    }) => {
      try {
        setSubmittingAssesment(true);
        await client.models.AssessmentInstance.update({
          id: assessmentId,
          responses: JSON.stringify(updatedResponses),
          score: JSON.stringify(updatedScores),
        });
        await fetchUserAssessments();
        setSubmittingAssesment(false);
      } catch (err) {
        setSubmittingAssesment(false);
      }
    },
    [dispatch]
  );

  return {
    submitTier1Assessment,
    fetchUserAssessments,
    updateTier1AssessmentResponse,
    userAssessments,
    userTier1Assessments,
    submittingAssesment,
  };
}
