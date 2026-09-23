from typing import List, Optional
from models import Opportunity, StudentProfile
from data.opportunities import get_all_opportunities

class DiscoveryAgent:
    def __init__(self):
        self.agent_name = "Opportunity Discovery Agent"

    def discover(
        self,
        profile: StudentProfile,
        category_filter: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[Opportunity]:
        """
        Discovers relevant funding opportunities based on student degree level, major, and search parameters.
        """
        all_opps = get_all_opportunities()
        discovered = []

        student_level = profile.education_level.lower()
        student_course = profile.course.lower()

        for opp in all_opps:
            # Category filter
            if category_filter and category_filter.lower() != "all":
                if opp.category.lower() != category_filter.lower():
                    continue

            # Text search filter
            if search_query:
                q = search_query.lower()
                matches_title = q in opp.title.lower()
                matches_provider = q in opp.provider.lower()
                matches_desc = q in opp.description.lower()
                matches_course = any(q in c.lower() for c in opp.target_courses)
                if not (matches_title or matches_provider or matches_desc or matches_course):
                    continue

            # Relevance match (Degree level or course broad match)
            level_match = any(deg.lower() == student_level for deg in opp.degree_levels)
            course_match = any(
                c.lower() in student_course or student_course in c.lower() or c.lower() == "all courses"
                for c in opp.target_courses
            )

            # Discovery should surface opportunities that actually fit the student's
            # current study path; text search narrows this relevant set further.
            if level_match and course_match:
                discovered.append(opp)

        return sorted(discovered, key=lambda opp: (opp.days_left, -opp.amount_inr))
